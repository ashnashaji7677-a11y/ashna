import React, { useState } from 'react';
import { Claim, ClaimStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ImageLightbox } from '../common/ImageLightbox';
import { claimService } from '../../services/claimService';
import { useToast } from '../common/Toast';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ZoomIn, 
  MessageSquare, 
  AlertTriangle,
  Lock,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

interface EvidenceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim | null;
  onStatusUpdated: () => void;
  onOpenChatWithClaimant?: (convId?: string) => void;
}

export const EvidenceReviewModal: React.FC<EvidenceReviewModalProps> = ({
  isOpen,
  onClose,
  claim,
  onStatusUpdated,
  onOpenChatWithClaimant,
}) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  if (!claim || !claim.item) return null;

  const handleUpdateStatus = async (status: ClaimStatus) => {
    setActionLoading(true);
    try {
      const updated = await claimService.updateClaimStatus(
        claim.id,
        status,
        status === 'rejected' ? rejectionReason : undefined
      );
      if (updated) {
        if (status === 'approved') {
          showToast('Claim approved! Safe return coordination message sent.', 'success');
        } else if (status === 'rejected') {
          showToast('Claim rejected with stated reason.', 'info');
          setRejecting(false);
          setRejectionReason('');
        } else {
          showToast(`Claim marked as ${status.replace('_', ' ')}.`, 'info');
        }
        onStatusUpdated();
        if (status === 'approved' || status === 'rejected') {
          onClose();
        }
      }
    } catch {
      showToast('Error updating claim status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending Verification
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5EC] text-[#238B57]">
            <CheckCircle className="w-3.5 h-3.5" /> Approved Ownership
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Review Ownership Proof & Evidence" maxWidth="max-w-4xl">
        <div className="space-y-6">
          
          {/* Header Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F9FBF9] border border-[#E8F5EC]">
            <div>
              <span className="text-xs font-semibold text-[#78847D] uppercase tracking-wider block">
                Verification Request
              </span>
              <h3 className="text-base font-bold text-[#202B25]">{claim.item.item_name}</h3>
              <div className="flex items-center gap-3 text-xs text-[#78847D] mt-1">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#238B57]" />
                  Claimant: <strong className="text-[#202B25]">{claim.claimant?.full_name || 'Anonymous User'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted: {new Date(claim.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>{getStatusBadge(claim.status)}</div>
          </div>

          {/* Side-by-Side Comparison Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Found Item (Your Listing) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8F5EC] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#202B25] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#238B57]"></span>
                    Found Item (Your Listing)
                  </h4>
                  <span className="text-[11px] text-[#78847D]">{claim.item.category}</span>
                </div>

                {/* Found Images Gallery */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {claim.item.image_urls.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setLightboxImage(img)}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer border border-[#E8F5EC]"
                    >
                      <img src={img} alt="Found item" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-[#78847D]">Found Location:</span>
                    <p className="text-[#202B25] font-medium">{claim.item.location}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#78847D]">Public Description:</span>
                    <p className="text-[#202B25] leading-relaxed">{claim.item.description}</p>
                  </div>
                  {claim.item.additional_details && (
                    <div>
                      <span className="font-semibold text-[#78847D]">Private Finder Notes:</span>
                      <p className="text-[#202B25] bg-[#F9FBF9] p-2 rounded-lg border border-[#E8F5EC]">
                        {claim.item.additional_details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Claimant's Submitted Evidence */}
            <div className="p-4 rounded-2xl bg-[#F9FBF9] border-2 border-[#238B57]/30 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#238B57] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#238B57]" />
                    Claimant's Proof of Ownership
                  </h4>
                  <span className="text-[11px] bg-[#E8F5EC] text-[#238B57] px-2 py-0.5 rounded-full font-medium">
                    Evidence
                  </span>
                </div>

                {/* Evidence Images */}
                {claim.evidence_image_urls && claim.evidence_image_urls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {claim.evidence_image_urls.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setLightboxImage(img)}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer border border-[#238B57]/30"
                      >
                        <img src={img} alt="Evidence photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          Proof #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 mb-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>No image evidence was attached to this claim.</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-[#78847D] uppercase tracking-wider block text-[10px] mb-1">
                      Unique Identifying Features Described:
                    </span>
                    <p className="p-2.5 rounded-xl bg-white border border-[#E8F5EC] text-[#202B25] leading-relaxed">
                      {claim.evidence_description}
                    </p>
                  </div>

                  {claim.secret_details && (
                    <div>
                      <div className="flex items-center gap-1 text-[#238B57] mb-1">
                        <Lock className="w-3 h-3" />
                        <span className="font-semibold uppercase tracking-wider text-[10px]">
                          Private Details Only Owner Knows:
                        </span>
                      </div>
                      <p className="p-2.5 rounded-xl bg-[#E8F5EC]/60 border border-[#238B57]/30 text-[#202B25] font-medium leading-relaxed">
                        {claim.secret_details}
                      </p>
                    </div>
                  )}

                  {claim.rejection_reason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      <span className="font-bold block mb-0.5">Rejection Reason Provided:</span>
                      <p>{claim.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Form Box (if toggled) */}
          {rejecting && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-800 text-sm font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Reason for Rejecting Ownership Proof</span>
              </div>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Serial number does not match, or item features differ from our found item..."
                className="w-full text-xs p-2.5 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-3 py-1.5 text-xs text-[#78847D] hover:text-[#202B25]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={!rejectionReason.trim() || actionLoading}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Review Action Toolbar */}
          <div className="pt-4 border-t border-[#E8F5EC] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {onOpenChatWithClaimant && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChatWithClaimant();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#238B57] text-[#202B25] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#238B57]" />
                  <span>Open Safe Chat</span>
                </button>
              )}

              {claim.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('under_review')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Mark Under Review
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {claim.status !== 'rejected' && !rejecting && (
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Proof</span>
                </button>
              )}

              {claim.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#238B57] hover:bg-[#1b6d44] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve Claim & Start Handover</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Lightbox for zooming into evidence receipts / photos */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
        altText="Enlarged evidence photo"
      />
    </>
  );
};

