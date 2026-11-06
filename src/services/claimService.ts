import { Claim, ClaimStatus } from '../types';
import { localStore } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { chatService } from './chatService';

export const claimService = {
  getClaims(): Claim[] {
    return localStore.getClaims();
  },

  getClaimsByItemId(itemId: string): Claim[] {
    return localStore.getClaimsByItemId(itemId);
  },

  getClaimsReceivedByUser(userId: string): Claim[] {
    return localStore.getClaimsByReviewerId(userId);
  },

  getClaimsSubmittedByUser(userId: string): Claim[] {
    return localStore.getClaimsByClaimantId(userId);
  },

  getClaimById(claimId: string): Claim | undefined {
    return localStore.getClaims().find((c) => c.id === claimId);
  },

  async submitClaim(claimData: {
    item_id: string;
    claimant_id: string;
    reviewer_id: string;
    evidence_image_urls: string[];
    evidence_description: string;
    secret_details?: string;
  }): Promise<Claim> {
    const newClaim: Claim = {
      id: 'claim-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      item_id: claimData.item_id,
      claimant_id: claimData.claimant_id,
      reviewer_id: claimData.reviewer_id,
      evidence_image_urls: claimData.evidence_image_urls,
      evidence_description: claimData.evidence_description,
      secret_details: claimData.secret_details,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('claims').insert({
          id: newClaim.id,
          item_id: newClaim.item_id,
          claimant_id: newClaim.claimant_id,
          reviewer_id: newClaim.reviewer_id,
          evidence_image_urls: newClaim.evidence_image_urls,
          evidence_description: newClaim.evidence_description,
          secret_details: newClaim.secret_details,
          status: newClaim.status,
        });
      } catch (err) {
        console.warn('Supabase insert claim error:', err);
      }
    }

    localStore.saveClaim(newClaim);

    // Also update item status to 'claimed' or keep track
    const item = localStore.getItemById(claimData.item_id);
    if (item && item.status === 'open') {
      item.status = 'claimed';
      localStore.saveItem(item);
    }

    // Automatically initiate a conversation between claimant and finder
    await chatService.getOrCreateConversation(
      claimData.item_id,
      claimData.claimant_id,
      claimData.reviewer_id,
      newClaim.id
    );

    return newClaim;
  },

  async updateClaimStatus(
    claimId: string,
    newStatus: ClaimStatus,
    rejectionReason?: string
  ): Promise<Claim | null> {
    const claim = localStore.getClaims().find((c) => c.id === claimId);
    if (!claim) return null;

    claim.status = newStatus;
    claim.updated_at = new Date().toISOString();
    if (rejectionReason) {
      claim.rejection_reason = rejectionReason;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('claims')
          .update({
            status: newStatus,
            rejection_reason: rejectionReason || null,
            updated_at: claim.updated_at,
          })
          .eq('id', claimId);
      } catch (err) {
        console.warn('Supabase update claim error:', err);
      }
    }

    localStore.saveClaim(claim);

    // If claim is approved, make sure conversation has an automated handover message
    if (newStatus === 'approved') {
      const conv = await chatService.getOrCreateConversation(
        claim.item_id,
        claim.claimant_id,
        claim.reviewer_id,
        claim.id
      );
      await chatService.sendMessage(
        conv.id,
        claim.reviewer_id,
        '🎉 Ownership claim verified! Your evidence has been approved. Let’s coordinate a safe time and public place for the return of your item.'
      );

      // Update item status to resolved
      const item = localStore.getItemById(claim.item_id);
      if (item) {
        item.status = 'resolved';
        localStore.saveItem(item);
      }
    }

    // If rejected and no other pending claims, reset item status to open
    if (newStatus === 'rejected') {
      const remainingPending = localStore
        .getClaimsByItemId(claim.item_id)
        .filter((c) => c.id !== claimId && (c.status === 'pending' || c.status === 'under_review'));
      if (remainingPending.length === 0) {
        const item = localStore.getItemById(claim.item_id);
        if (item && item.status === 'claimed') {
          item.status = 'open';
          localStore.saveItem(item);
        }
      }
    }

    return claim;
  },
};

