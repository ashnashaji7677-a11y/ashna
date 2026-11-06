import React, { useState } from 'react';
import { User, ItemCategory } from '../../types';
import { ImageUploader } from '../items/ImageUploader';
import { itemService } from '../../services/itemService';
import { useToast } from '../common/Toast';
import { CATEGORIES } from '../items/ItemFilterBar';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  Plus,
  Send
} from 'lucide-react';

interface ReportFoundPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onItemCreated: (itemId: string) => void;
  onRequireAuth: () => void;
}

export const ReportFoundPage: React.FC<ReportFoundPageProps> = ({
  currentUser,
  onNavigate,
  onItemCreated,
  onRequireAuth,
}) => {
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [images, setImages] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!location.trim()) {
      showToast('Please specify where you found this item.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please provide a brief description of the found item.', 'error');
      return;
    }

    // If user didn't enter an exact name, auto-generate friendly estimated name from category and location
    const finalItemName = itemName.trim() || `Found ${category} near ${location.trim()}`;

    setLoading(true);
    try {
      const created = await itemService.createItem({
        user_id: currentUser.id,
        item_name: finalItemName,
        category,
        description: description.trim(),
        location: location.trim(),
        date_reported: dateFound,
        item_type: 'found',
        image_urls: images,
        status: 'open',
        additional_details: additionalDetails.trim() || undefined,
        contact_preference: 'chat',
      });

      showToast('Found item listed successfully! Thank you for your honesty.', 'success');
      onItemCreated(created.id);
    } catch {
      showToast('Error listing found item. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('found')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#78847D] hover:text-[#202B25] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Found Items</span>
      </button>

      <div className="bg-white rounded-3xl border border-[#E8F5EC] p-6 sm:p-10 shadow-xs">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#238B57] bg-[#E8F5EC] px-3 py-1 rounded-full">
            Good Samaritan Listing
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202B25] mt-2">
            Report a Found Item
          </h1>
          <p className="text-sm text-[#78847D] mt-1">
            Found someone's property? You don't need to know the exact brand or model. Just choose a category, snap a photo, and note where you found it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Selection First (Easy for Finders) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
                Date Found *
              </label>
              <input
                type="date"
                required
                value={dateFound}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateFound(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
              />
            </div>
          </div>

          {/* Item Name or Estimated Type */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider">
                Item Name or Estimated Type (Optional)
              </label>
              <span className="text-[11px] text-[#78847D]">
                Exact name not required
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Black Wireless Earbuds Case, Car Keys with Red Ribbon, or Brown Leather Watch"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
            />
            <p className="text-[11px] text-[#78847D] mt-1">
              If left blank, we will automatically label it based on your category and location.
            </p>
          </div>

          {/* Location Found */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Location Found *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#78847D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Central Metro Station Platform 2, Community Park Bench, Mall Food Court"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
              />
            </div>
          </div>

          {/* Photos Upload */}
          <div className="p-4 rounded-2xl bg-[#F9FBF9] border border-[#E8F5EC]">
            <ImageUploader
              images={images}
              onChange={setImages}
              label="Photos of Found Item"
              helperText="Upload clear photos of what you found. Owners will use these to identify their item and submit evidence."
              maxImages={5}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Public Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe color, general condition, and where you placed it (e.g. 'Found under the wooden table in the cafe. Kept safely in my possession until owner claims')."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Additional Information / Private Verification Details */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Additional Information / Private Notes (Optional)
            </label>
            <p className="text-xs text-[#78847D] mb-1.5">
              You can keep secret details in mind (e.g. what is written on the back, or what was inside the pocket) to check against the owner's evidence submission.
            </p>
            <input
              type="text"
              placeholder="e.g. Has a small engraving on the back that owner must name"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Safety Notice */}
          <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#238B57]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#238B57] shrink-0 mt-0.5" />
            <div className="text-xs text-[#202B25]">
              <span className="font-semibold block">You Control Claim Approvals:</span>
              <span>Potential owners will submit proof of ownership through FindIt. You will review their submitted evidence side-by-side with your item before approving any return.</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('found')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#78847D] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing Listing...' : 'Publish Found Item Listing'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

