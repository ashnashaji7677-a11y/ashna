import React from 'react';
import { Item } from '../../types';
import { MapPin, Calendar, ArrowRight, Tag, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onViewDetails: (itemId: string) => void;
  onClaim?: (item: Item) => void;
  isOwner?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
}) => {
  const isFound = item.item_type === 'found';
  const defaultImage = isFound
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80';

  const displayImage = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : defaultImage;

  return (
    <div
      onClick={() => onViewDetails(item.id)}
      className="group bg-white rounded-2xl border border-[#E8F5EC] overflow-hidden shadow-xs hover:shadow-md hover:border-[#238B57]/40 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image Preview Header */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={item.item_name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-xs ${
              isFound
                ? 'bg-[#238B57] text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isFound ? 'Found' : 'Lost'}
          </span>

          {item.status === 'resolved' && (
            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> Resolved
            </span>
          )}

          {item.status === 'claimed' && (
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3" /> Under Review
            </span>
          )}
        </div>

        {/* Image count pill */}
        {item.image_urls && item.image_urls.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
            {item.image_urls.length} photos
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          
          {/* Category Pill */}
          <div className="flex items-center gap-1 text-xs font-semibold text-[#238B57]">
            <Tag className="w-3 h-3" />
            <span>{item.category}</span>
          </div>

          {/* Item Name */}
          <h3 className="text-base font-bold text-[#202B25] group-hover:text-[#238B57] transition-colors line-clamp-1">
            {item.item_name}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-[#78847D] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Date Footer */}
        <div className="pt-4 mt-4 border-t border-[#E8F5EC] space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-[#78847D]">
            <MapPin className="w-3.5 h-3.5 text-[#238B57] shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#78847D]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#78847D] shrink-0" />
              <span>{item.date_reported}</span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#238B57] group-hover:translate-x-0.5 transition-transform">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

