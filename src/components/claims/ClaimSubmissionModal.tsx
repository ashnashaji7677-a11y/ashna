import React, { useState } from 'react';
import { Item, User } from '../../types';
import { Modal } from '../common/Modal';
import { ImageUploader } from '../items/ImageUploader';
import { claimService } from '../../services/claimService';
import { useToast } from '../common/Toast';
import { ShieldCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';

interface ClaimSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  currentUser: User | null;
  onClaimSubmitted: () => void;
  onRequireAuth: () => void;
}

export const ClaimSubmissionModal: React.FC<ClaimSubmissionModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onClaimSubmitted,
  onRequireAuth,
}) => {
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [secretDetails, setSecretDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!evidenceDescription.trim()) {
      showToast('Please provide details explaining how you can prove ownership.', 'error');
      return;
    }

    setLoading(true);
    try {
      await claimService.submitClaim({
        item_id: item.id,
        claimant_id: currentUser.id,
        reviewer_id: item.user_id,
        evidence_image_urls: evidenceImages,
        evidence_description: evidenceDescription,
        secret_details: secretDetails,
      });

      showToast('Ownership claim submitted for review! The finder has been notified.', 'success');
      setEvidenceImages([]);
      setEvidenceDescription('');
      setSecretDetails('');
      onClaimSubmitted();
      onClose();
    } catch {
      showToast('Failed to submit claim. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Claim Item & Submit Ownership Proof" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Item Summary Card */}
        <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F9FBF9] border border-[#E8F5EC]">
          <img
            src={item.image_urls[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
            alt={item.item_name}
            className="w-12 h-12 rounded-lg object-cover border border-[#E8F5EC] shrink-0"
          />
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#238B57] uppercase tracking-wide">
              Found Item Verification
            </span>
            <h4 className="text-sm font-bold text-[#202B25] truncate">{item.item_name}</h4>
            <p className="text-xs text-[#78847D] truncate">Found at: {item.location}</p>
          </div>
        </div>

        {/* Security / Privacy Banner */}
        <div className="p-3.5 rounded-xl bg-[#E8F5EC] border border-[#238B57]/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#238B57] shrink-0 mt-0.5" />
          <div className="text-xs text-[#202B25] leading-relaxed">
            <p className="font-semibold text-[#202B25]">Manual Finder Verification</p>
            <p className="text-[#78847D] mt-0.5">
              Claims are NOT approved automatically. The finder will privately compare your photos and answers before confirming ownership to coordinate a safe return.
            </p>
          </div>
        </div>

        {/* Evidence Images Upload */}
        <div>
          <ImageUploader
            images={evidenceImages}
            onChange={setEvidenceImages}
            label="Upload Proof of Ownership Photos"
            helperText="Upload purchase receipts, serial number photos, or pictures showing you with this item."
            maxImages={4}
          />
        </div>

        {/* Unique Identifying Features */}
        <div>
          <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
            Unique Identifying Features *
          </label>
          <p className="text-xs text-[#78847D] mb-1.5">
            Describe specific marks, scratches, stickers, keychains, or damage that distinguish your item.
          </p>
          <textarea
            required
            rows={3}
            value={evidenceDescription}
            onChange={(e) => setEvidenceDescription(e.target.value)}
            placeholder="e.g. There is a small scratch on the right corner, a green carabiner on the zipper, and my initials are written on the inside label..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] transition-all bg-[#F9FBF9]"
          />
        </div>

        {/* Secret / Hidden Details */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-[#238B57]" />
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider">
              Secret Details Only You Know (Optional)
            </label>
          </div>
          <p className="text-xs text-[#78847D] mb-1.5">
            Details not visible in the public photos (e.g. lock combination, internal items in zipped compartments, custom wallpaper).
          </p>
          <input
            type="text"
            value={secretDetails}
            onChange={(e) => setSecretDetails(e.target.value)}
            placeholder="e.g. Inside the small zipped pocket there is a $10 bill and a student bus pass..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] transition-all bg-[#F9FBF9]"
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-[#E8F5EC] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#78847D] hover:text-[#202B25] rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#238B57] hover:bg-[#1b6d44] text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Submitting...' : 'Submit Claim for Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

