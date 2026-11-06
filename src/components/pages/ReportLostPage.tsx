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
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Send 
} from 'lucide-react';

interface ReportLostPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onItemCreated: (itemId: string) => void;
  onRequireAuth: () => void;
}

export const ReportLostPage: React.FC<ReportLostPageProps> = ({
  currentUser,
  onNavigate,
  onItemCreated,
  onRequireAuth,
}) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [images, setImages] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [contactPreference, setContactPreference] = useState<'chat' | 'email' | 'phone'>('chat');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!itemName.trim()) {
      showToast('Please enter an item name.', 'error');
      return;
    }

    if (!location.trim()) {
      showToast('Please enter the last seen location.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please provide a description of the missing item.', 'error');
      return;
    }

    setLoading(true);
    try {
      const created = await itemService.createItem({
        user_id: currentUser.id,
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        date_reported: dateLost,
        item_type: 'lost',
        image_urls: images,
        status: 'open',
        additional_details: additionalDetails.trim() || undefined,
        contact_preference: contactPreference,
      });

      showToast('Lost item report published successfully!', 'success');
      onItemCreated(created.id);
    } catch {
      showToast('Error publishing report. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('lost')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#78847D] hover:text-[#202B25] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lost Items</span>
      </button>

      <div className="bg-white rounded-3xl border border-[#E8F5EC] p-6 sm:p-10 shadow-xs">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            Lost Property Form
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#202B25] mt-2">
            Report a Missing Item
          </h1>
          <p className="text-sm text-[#78847D] mt-1">
            Fill in the details about what you lost. Clear photos and specific locations help finders recognize your item faster.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Navy Blue Herschel Backpack, Apple Watch Series 8"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Category & Date Grid */}
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
                Date Lost *
              </label>
              <input
                type="date"
                required
                value={dateLost}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateLost(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
              />
            </div>
          </div>

          {/* Last Seen Location */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Last Seen Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#78847D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="e.g. Science Library 2nd floor, Metro Line 2, Central Park Bench"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
              />
            </div>
          </div>

          {/* Public Description */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Public Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what the item looks like, brand, color, and any general circumstances."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Image Uploader */}
          <div className="p-4 rounded-2xl bg-[#F9FBF9] border border-[#E8F5EC]">
            <ImageUploader
              images={images}
              onChange={setImages}
              label="Item Photos (Multiple Allowed)"
              helperText="Upload any photos of the item or catalog images to help finders identify it."
              maxImages={5}
            />
          </div>

          {/* Additional Identifying Details */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1.5">
              Additional Identifying Details (Optional)
            </label>
            <p className="text-xs text-[#78847D] mb-1.5">
              Unique scratches, stickers, or hidden marks you can use later to verify ownership if found.
            </p>
            <input
              type="text"
              placeholder="e.g. Has a yellow NASA sticker on the bottom left corner"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
            />
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-2">
              Contact Preference for Finders
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'chat', label: 'In-App Chat', note: 'Recommended (Safe & Private)' },
                { id: 'email', label: 'Email Only', note: 'Relayed via FindIt' },
                { id: 'phone', label: 'Phone', note: 'Shared after verification' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setContactPreference(opt.id as 'chat' | 'email' | 'phone')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    contactPreference === opt.id
                      ? 'border-[#238B57] bg-[#E8F5EC] text-[#202B25]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-[#78847D]'
                  }`}
                >
                  <p className="text-xs font-bold text-[#202B25]">{opt.label}</p>
                  <p className="text-[10px] text-[#78847D] mt-0.5">{opt.note}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Reminder */}
          <div className="p-4 rounded-2xl bg-[#E8F5EC] border border-[#238B57]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#238B57] shrink-0 mt-0.5" />
            <div className="text-xs text-[#202B25]">
              <span className="font-semibold block">Privacy Protection Active:</span>
              <span>Your exact phone number and home address are never published publicly. When someone finds your item, they will reach out via in-app safe chat.</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('lost')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#78847D] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing Report...' : 'Publish Lost Item Report'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

