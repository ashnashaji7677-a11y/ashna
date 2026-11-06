import React, { useState } from 'react';
import { Item, ItemCategory } from '../../types';
import { ItemCard } from '../items/ItemCard';
import { 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Lock, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  MapPin, 
  Sparkles,
  Users,
  Compass,
  FileCheck
} from 'lucide-react';

interface LandingPageProps {
  lostItems: Item[];
  foundItems: Item[];
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onViewItem: (itemId: string) => void;
  onSearchGlobal: (query: string, category?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lostItems,
  foundItems,
  onNavigate,
  onViewItem,
  onSearchGlobal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'found' | 'lost'>('found');

  const popularCategories: { name: ItemCategory; icon: string }[] = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Wallets & Purses', icon: '👛' },
    { name: 'Keys', icon: '🔑' },
    { name: 'Bags & Backpacks', icon: '🎒' },
    { name: 'Documents & IDs', icon: '🪪' },
    { name: 'Jewelry & Watches', icon: '⌚' },
  ];

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchGlobal(searchQuery, selectedCategory === 'All' ? undefined : selectedCategory);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#E8F5EC] rounded-full blur-3xl -z-10 opacity-70 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EC] text-[#238B57] text-xs font-semibold border border-[#238B57]/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Private Proof-of-Ownership Verification</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#202B25] font-heading leading-tight">
            Lost Something? <br />
            <span className="text-[#238B57]">Let's Find It.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-[#78847D] max-w-2xl mx-auto leading-relaxed">
            A simple way to reconnect lost belongings with the people who matter.
            Secure image verification and private messaging protect every return.
          </p>

          {/* Two Prominent CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('report-lost')}
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Report Lost Item</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('report-found')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#238B57]/25 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <span>Report Found Item</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="pt-6 max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-lg border border-[#E8F5EC] flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <Search className="w-4 h-4 text-[#78847D] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, location (e.g. Metro, Sony headphones)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-[#202B25] placeholder:text-[#78847D] focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter search by category"
                className="px-3 py-2 text-xs font-medium text-[#202B25] bg-[#F9FBF9] rounded-xl border border-gray-200 focus:outline-none focus:border-[#238B57]"
              >
                <option value="All">All Categories</option>
                {popularCategories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Category Quick Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-[#78847D] font-medium mr-1">Popular:</span>
            {popularCategories.map((c) => (
              <button
                key={c.name}
                onClick={() => onSearchGlobal('', c.name)}
                className="px-3 py-1 rounded-full text-xs bg-white hover:bg-[#E8F5EC] text-[#202B25] hover:text-[#238B57] border border-[#E8F5EC] transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* Recently Reported Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#202B25]">
              Recently Reported Belongings
            </h2>
            <p className="text-sm text-[#78847D] mt-1">
              Browse recently submitted lost items and found discoveries waiting to be claimed.
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#E8F5EC] shadow-2xs">
            <button
              onClick={() => setActiveTab('found')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'found'
                  ? 'bg-[#238B57] text-white shadow-xs'
                  : 'text-[#78847D] hover:text-[#202B25]'
              }`}
            >
              Found Items ({foundItems.length})
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lost'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[#78847D] hover:text-[#202B25]'
              }`}
            >
              Lost Items ({lostItems.length})
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'found' ? (
            foundItems.slice(0, 4).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewItem}
              />
            ))
          ) : (
            lostItems.slice(0, 4).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewItem}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center pt-8">
          <button
            onClick={() => onNavigate(activeTab === 'found' ? 'found' : 'lost')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#E8F5EC] border border-[#238B57]/30 text-[#238B57] font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>View All {activeTab === 'found' ? 'Found' : 'Lost'} Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>


      {/* How It Works Section (3 Steps) */}
      <section className="bg-white border-y border-[#E8F5EC] py-20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#238B57] bg-[#E8F5EC] px-3 py-1 rounded-full">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-bold text-[#202B25] mt-3">
              How FindIt Works
            </h2>
            <p className="text-sm text-[#78847D] mt-2">
              Designed to make reconnecting belongings effortless while safeguarding owners and finders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-[#F9FBF9] border border-[#E8F5EC] text-center relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EC] text-[#238B57] flex items-center justify-center font-bold text-xl mb-5 shadow-xs">
                1
              </div>
              <h3 className="text-lg font-bold text-[#202B25] mb-2">
                Report a lost or found item
              </h3>
              <p className="text-xs text-[#78847D] leading-relaxed">
                Post detailed descriptions, category, location, and photos. Finders don't even need the exact model name — a clear photo and category is enough.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-[#F9FBF9] border border-[#238B57]/30 text-center relative flex flex-col items-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#238B57] text-white flex items-center justify-center font-bold text-xl mb-5 shadow-xs">
                2
              </div>
              <h3 className="text-lg font-bold text-[#202B25] mb-2">
                Verify ownership using image evidence
              </h3>
              <p className="text-xs text-[#78847D] leading-relaxed">
                Potential owners click "Claim This Item" to privately submit photo proof (receipts, serial numbers, matching stickers) and secret details only the real owner knows.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-[#F9FBF9] border border-[#E8F5EC] text-center relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F5EC] text-[#238B57] flex items-center justify-center font-bold text-xl mb-5 shadow-xs">
                3
              </div>
              <h3 className="text-lg font-bold text-[#202B25] mb-2">
                Connect and return the item
              </h3>
              <p className="text-xs text-[#78847D] leading-relaxed">
                Once the finder approves the evidence, our secure one-to-one in-app chat opens so you can coordinate a safe public handover without sharing phone numbers.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Security & Verification Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#E8F5EC] border border-[#238B57]/20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-semibold text-[#238B57] uppercase tracking-wider bg-white px-3 py-1 rounded-full shadow-2xs">
              Built-In Safety First
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#202B25]">
              No Automated Guesswork. Every Claim is Manually Reviewed.
            </h3>
            <p className="text-sm text-[#78847D] leading-relaxed">
              We never approve ownership based on automated image resemblance alone. The person who picked up your item gets to compare side-by-side evidence photos and secret markers to guarantee the right person gets their item back.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#202B25]">
                <CheckCircle2 className="w-4 h-4 text-[#238B57]" />
                <span>Encrypted Evidence Storage</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#202B25]">
                <CheckCircle2 className="w-4 h-4 text-[#238B57]" />
                <span>Zero Public Phone Exposure</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#202B25]">
                <CheckCircle2 className="w-4 h-4 text-[#238B57]" />
                <span>Side-by-Side Review UI</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#202B25]">
                <CheckCircle2 className="w-4 h-4 text-[#238B57]" />
                <span>Safe Public Meetup Guides</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#E8F5EC] max-w-sm w-full space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#238B57]">
              <Lock className="w-4 h-4" />
              <span>Finder Verification Standard</span>
            </div>
            <p className="text-xs text-[#78847D]">
              "Alex Turner approved Sarah Connor's claim for Sony WH-1000XM4 after verifying matching cable adapter and purchase barcode."
            </p>
            <div className="p-3 rounded-xl bg-[#F9FBF9] border border-[#E8F5EC] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#202B25]">Claim Status</span>
              <span className="bg-[#E8F5EC] text-[#238B57] font-bold px-2 py-0.5 rounded-full text-[10px]">
                Verified & Handed Over
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

