import React, { useState, useEffect } from 'react';
import { Item, User, Claim } from '../../types';
import { itemService } from '../../services/itemService';
import { claimService } from '../../services/claimService';
import { chatService } from '../../services/chatService';
import { ClaimSubmissionModal } from '../claims/ClaimSubmissionModal';
import { EvidenceReviewModal } from '../claims/EvidenceReviewModal';
import { ImageLightbox } from '../common/ImageLightbox';
import { useToast } from '../common/Toast';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Share2, 
  Eye, 
  User as UserIcon,
  AlertTriangle,
  ZoomIn,
  Edit3,
  Trash2,
  Lock,
  ChevronRight
} from 'lucide-react';

interface ItemDetailPageProps {
  itemId: string;
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onOpenChatWithUser: (convId?: string) => void;
  onRequireAuth: () => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  itemId,
  currentUser,
  onNavigate,
  onOpenChatWithUser,
  onRequireAuth,
}) => {
  const [item, setItem] = useState<Item | undefined>(undefined);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaimForReview, setSelectedClaimForReview] = useState<Claim | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [itemClaims, setItemClaims] = useState<Claim[]>([]);
  const { showToast } = useToast();

  const loadItemData = () => {
    const fetched = itemService.getItemById(itemId);
    setItem(fetched);
    if (fetched) {
      const claims = claimService.getClaimsByItemId(itemId);
      setItemClaims(claims);
    }
  };

  useEffect(() => {
    loadItemData();
  }, [itemId]);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-[#202B25] mb-2">Item Not Found</h2>
        <p className="text-sm text-[#78847D] mb-6">This listing may have been removed or resolved.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-[#238B57] text-white rounded-xl text-sm font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isFound = item.item_type === 'found';
  const isOwner = currentUser?.id === item.user_id;

  // Has the current user already submitted a claim on this item?
  const myExistingClaim = currentUser
    ? itemClaims.find((c) => c.claimant_id === currentUser.id)
    : null;

  const defaultImage = isFound
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'
    : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800';

  const images = item.image_urls && item.image_urls.length > 0 ? item.image_urls : [defaultImage];

  const handleStartFoundReturnChat = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    // If visitor found the item that someone lost:
    const conv = await chatService.getOrCreateConversation(
      item.id,
      item.user_id, // lost item reporter
      currentUser.id // finder
    );
    await chatService.sendMessage(
      conv.id,
      currentUser.id,
      `Hi! I saw your report for "${item.item_name}" and believe I have found it or have information regarding its location.`
    );
    showToast('Conversation started with the owner!', 'success');
    onOpenChatWithUser(conv.id);
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Are you sure you want to delete this listing report?')) {
      await itemService.deleteItem(item.id);
      showToast('Item listing removed.', 'info');
      onNavigate(isFound ? 'found' : 'lost');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(isFound ? 'found' : 'lost')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#78847D] hover:text-[#202B25] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isFound ? 'Found' : 'Lost'} Listings</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#78847D] hover:text-[#202B25] hover:bg-white transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Photo Gallery Column (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Large Image */}
          <div
            onClick={() => setLightboxImage(images[activeImageIndex])}
            className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 border border-[#E8F5EC] shadow-sm cursor-pointer group"
          >
            <img
              src={images[activeImageIndex]}
              alt={item.item_name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs ${
                  isFound ? 'bg-[#238B57] text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {isFound ? 'Found Item' : 'Lost Item'}
              </span>

              {item.status === 'resolved' && (
                <span className="bg-emerald-700 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reconnected & Resolved
                </span>
              )}
            </div>

            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium opacity-90 group-hover:opacity-100">
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Click to enlarge</span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#238B57] ring-2 ring-[#238B57]/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Safe Handover Advice Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#E8F5EC] space-y-3">
            <h4 className="text-xs font-bold text-[#202B25] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#238B57]" />
              Safe Handover Principles
            </h4>
            <ul className="text-xs text-[#78847D] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Always meet in a well-lit, public location (e.g. university lobby, library, police station parking).</li>
              <li>Never pay electronic money transfers upfront to claim or return an item.</li>
              <li>Inspect physical matching markers before completing the return.</li>
            </ul>
          </div>
        </div>

        {/* Details & Claim Actions Column (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8F5EC] p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Category & Status */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#238B57] bg-[#E8F5EC] px-3 py-1 rounded-full">
                <Tag className="w-3.5 h-3.5" />
                {item.category}
              </span>
              <span className="text-xs text-[#78847D]">
                Reported {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202B25] font-heading leading-snug">
              {item.item_name}
            </h1>

            {/* Quick Metadata Grid */}
            <div className="p-4 rounded-2xl bg-[#F9FBF9] border border-[#E8F5EC] space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <MapPin className="w-4 h-4 text-[#238B57] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#78847D] block">
                    {isFound ? 'Location Found' : 'Last Seen Location'}
                  </span>
                  <span className="text-[#202B25] font-medium">{item.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <Calendar className="w-4 h-4 text-[#238B57] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#78847D] block">
                    {isFound ? 'Date Found' : 'Date Lost'}
                  </span>
                  <span className="text-[#202B25] font-medium">{item.date_reported}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <UserIcon className="w-4 h-4 text-[#238B57] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#78847D] block">Reported By</span>
                  <span className="text-[#202B25] font-medium">
                    {item.user?.full_name || 'Community Member'} {isOwner && '(You)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78847D] mb-2">
                Description
              </h3>
              <p className="text-sm text-[#202B25] leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* Finder's Additional Note (if present) */}
            {item.additional_details && (
              <div className="p-3.5 rounded-xl bg-[#F9FBF9] border border-[#E8F5EC] text-xs space-y-1">
                <span className="font-semibold text-[#202B25] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#238B57]" />
                  Finder's Verification Note
                </span>
                <p className="text-[#78847D] leading-relaxed">
                  {item.additional_details}
                </p>
              </div>
            )}

            {/* CTAs / ACTIONS SECTION */}
            <div className="pt-4 border-t border-[#E8F5EC] space-y-3">
              
              {/* IF VIEWER IS THE OWNER WHO REPORTED IT */}
              {isOwner ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[#E8F5EC] rounded-xl text-xs text-[#238B57] font-semibold text-center">
                    You reported this {isFound ? 'found' : 'lost'} listing.
                  </div>

                  {isFound && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#78847D]">
                        <span className="font-semibold text-[#202B25]">Claims Received ({itemClaims.length})</span>
                        <span>Review evidence</span>
                      </div>

                      {itemClaims.length > 0 ? (
                        itemClaims.map((claim) => (
                          <div
                            key={claim.id}
                            className="p-3 rounded-xl border border-[#E8F5EC] bg-[#F9FBF9] flex items-center justify-between gap-2"
                          >
                            <div className="text-xs">
                              <p className="font-bold text-[#202B25]">{claim.claimant?.full_name || 'Claimant'}</p>
                              <p className="text-[11px] text-[#78847D]">Status: {claim.status.replace('_', ' ')}</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedClaimForReview(claim);
                                setReviewModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-[#238B57] hover:bg-[#1b6d44] text-white text-xs font-semibold rounded-lg shadow-2xs"
                            >
                              Review Proof
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#78847D] italic">No one has submitted a claim for this item yet.</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleDeleteItem}
                      className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Listing
                    </button>
                  </div>
                </div>
              ) : isFound ? (
                /* FOR A FOUND ITEM (VISITOR WANTS TO CLAIM) */
                <div className="space-y-3">
                  {myExistingClaim ? (
                    <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#238B57]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#202B25]">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#238B57]" />
                          Your Claim Status:
                        </span>
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-[#238B57] text-white text-[11px]">
                          {myExistingClaim.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#78847D]">
                        Your ownership proof is submitted. The finder will review your photos and description.
                      </p>
                      <button
                        onClick={() => onOpenChatWithUser()}
                        className="w-full mt-2 py-2.5 bg-white border border-[#238B57]/30 text-[#238B57] rounded-xl text-xs font-semibold hover:bg-[#F9FBF9] flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Open Safe Chat with Finder
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onRequireAuth();
                          } else {
                            setClaimModalOpen(true);
                          }
                        }}
                        className="w-full py-3.5 px-6 bg-[#238B57] hover:bg-[#1b6d44] text-white font-bold text-sm rounded-xl shadow-md shadow-[#238B57]/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>Claim This Item (Submit Ownership Proof)</span>
                      </button>
                      <p className="text-[11px] text-[#78847D] text-center mt-2">
                        You will be asked to upload photos (receipts, serial numbers, marks) to prove ownership.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* FOR A LOST ITEM (VISITOR HAS FOUND IT) */
                <div>
                  <button
                    onClick={handleStartFoundReturnChat}
                    className="w-full py-3.5 px-6 bg-[#238B57] hover:bg-[#1b6d44] text-white font-bold text-sm rounded-xl shadow-md shadow-[#238B57]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>I Found This Item! (Message Owner)</span>
                  </button>
                  <p className="text-[11px] text-[#78847D] text-center mt-2">
                    Start a secure conversation with the owner to arrange a safe reunion.
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <ClaimSubmissionModal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          item={item}
          currentUser={currentUser}
          onClaimSubmitted={loadItemData}
          onRequireAuth={onRequireAuth}
        />
      )}

      {/* Evidence Review Modal (Side-by-Side) */}
      {selectedClaimForReview && (
        <EvidenceReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedClaimForReview(null);
          }}
          claim={selectedClaimForReview}
          onStatusUpdated={loadItemData}
          onOpenChatWithClaimant={() => onOpenChatWithUser()}
        />
      )}

      {/* Lightbox for zooming photos */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
        altText={item.item_name}
      />
    </div>
  );
};

