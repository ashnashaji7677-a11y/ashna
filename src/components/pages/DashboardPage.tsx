import React, { useState, useEffect } from 'react';
import { User, Item, Claim, Conversation } from '../../types';
import { itemService } from '../../services/itemService';
import { claimService } from '../../services/claimService';
import { authService } from '../../services/authService';
import { EvidenceReviewModal } from '../claims/EvidenceReviewModal';
import { ChatWindow } from '../chat/ChatWindow';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Settings, 
  Trash2, 
  Edit3, 
  ArrowRight,
  Eye,
  Check,
  MapPin,
  Calendar,
  Lock,
  Tag
} from 'lucide-react';

interface DashboardPageProps {
  currentUser: User;
  initialTab?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onViewItem: (itemId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  initialTab = 'overview',
  onNavigate,
  onViewItem,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [myLostItems, setMyLostItems] = useState<Item[]>([]);
  const [myFoundItems, setMyFoundItems] = useState<Item[]>([]);
  const [claimsReceived, setClaimsReceived] = useState<Claim[]>([]);
  const [claimsSubmitted, setClaimsSubmitted] = useState<Claim[]>([]);
  
  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedClaimForReview, setSelectedClaimForReview] = useState<Claim | null>(null);

  // Edit Item Modal state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<Item['status']>('open');

  // Profile Settings state
  const [profileName, setProfileName] = useState(currentUser.full_name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');

  const { showToast } = useToast();

  const loadDashboardData = () => {
    setMyLostItems(itemService.getUserItems(currentUser.id, 'lost'));
    setMyFoundItems(itemService.getUserItems(currentUser.id, 'found'));
    setClaimsReceived(claimService.getClaimsReceivedByUser(currentUser.id));
    setClaimsSubmitted(claimService.getClaimsSubmittedByUser(currentUser.id));
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser.id]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item report?')) {
      await itemService.deleteItem(itemId);
      showToast('Item deleted successfully.', 'info');
      loadDashboardData();
    }
  };

  const handleOpenEditItem = (item: Item) => {
    setEditingItem(item);
    setEditTitle(item.item_name);
    setEditDescription(item.description);
    setEditLocation(item.location);
    setEditStatus(item.status);
  };

  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    await itemService.updateItem(editingItem.id, {
      item_name: editTitle,
      description: editDescription,
      location: editLocation,
      status: editStatus,
    });

    showToast('Item listing updated successfully.', 'success');
    setEditingItem(null);
    loadDashboardData();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authService.updateProfile({
      full_name: profileName,
      email: profileEmail,
      phone: profilePhone,
    });
    showToast('Profile information saved.', 'success');
  };

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Pending Verification</span>;
      case 'under_review':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Under Review</span>;
      case 'approved':
        return <span className="bg-[#E8F5EC] text-[#238B57] text-[11px] font-bold px-2.5 py-0.5 rounded-full">Approved</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Rejected</span>;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'lost-reports', label: `My Lost Reports (${myLostItems.length})`, icon: Search },
    { id: 'found-reports', label: `My Found Reports (${myFoundItems.length})`, icon: CheckCircle2 },
    { id: 'claims-received', label: `Claims Received (${claimsReceived.length})`, icon: ShieldCheck },
    { id: 'claims-submitted', label: `Claims Submitted (${claimsSubmitted.length})`, icon: Clock },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Profile Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E8F5EC] shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.full_name}`}
            alt={currentUser.full_name}
            className="w-14 h-14 rounded-2xl object-cover border border-[#E8F5EC]"
          />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#238B57]">
              User Dashboard
            </span>
            <h1 className="text-2xl font-bold text-[#202B25]">{currentUser.full_name}</h1>
            <p className="text-xs text-[#78847D]">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('report-lost')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            + Report Lost
          </button>
          <button
            onClick={() => onNavigate('report-found')}
            className="px-4 py-2 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            + Report Found
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar + Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-[#E8F5EC] p-2 space-y-1 shadow-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#238B57] text-white shadow-xs'
                    : 'text-[#202B25] hover:bg-[#E8F5EC] hover:text-[#238B57]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content (md:col-span-9) */}
        <div className="md:col-span-9 space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E8F5EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#78847D] uppercase tracking-wider block">Lost Reports</span>
                  <span className="text-2xl font-extrabold text-[#202B25] mt-1 block">{myLostItems.length}</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#E8F5EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#78847D] uppercase tracking-wider block">Found Reports</span>
                  <span className="text-2xl font-extrabold text-[#238B57] mt-1 block">{myFoundItems.length}</span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#E8F5EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#78847D] uppercase tracking-wider block">Claims to Review</span>
                  <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
                    {claimsReceived.filter((c) => c.status === 'pending' || c.status === 'under_review').length}
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#E8F5EC] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#78847D] uppercase tracking-wider block">Submitted Claims</span>
                  <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{claimsSubmitted.length}</span>
                </div>
              </div>

              {/* Action Banner if there are pending claims to review */}
              {claimsReceived.some((c) => c.status === 'pending' || c.status === 'under_review') && (
                <div className="p-5 rounded-2xl bg-[#E8F5EC] border border-[#238B57]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#238B57] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#202B25]">Claims Pending Your Review</h3>
                      <p className="text-xs text-[#78847D]">Potential owners have submitted image evidence on items you found.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('claims-received')}
                    className="px-4 py-2 bg-[#238B57] text-white text-xs font-semibold rounded-xl hover:bg-[#1b6d44] transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              )}

              {/* Recent Active Listings */}
              <div className="bg-white rounded-2xl border border-[#E8F5EC] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202B25]">Recent Listings</h3>
                  <button
                    onClick={() => setActiveTab('found-reports')}
                    className="text-xs text-[#238B57] hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-[#E8F5EC]">
                  {[...myFoundItems, ...myLostItems].slice(0, 4).map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image_urls[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100'}
                          alt={item.item_name}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#202B25] truncate">{item.item_name}</p>
                          <p className="text-[11px] text-[#78847D] truncate">{item.location} • {item.date_reported}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.item_type === 'found' ? 'bg-[#E8F5EC] text-[#238B57]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.item_type.toUpperCase()}
                        </span>
                        <button
                          onClick={() => onViewItem(item.id)}
                          className="p-1.5 rounded-lg text-[#78847D] hover:text-[#238B57] hover:bg-[#E8F5EC]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MY LOST REPORTS TAB */}
          {activeTab === 'lost-reports' && (
            <div className="bg-white rounded-2xl border border-[#E8F5EC] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#202B25]">My Lost Item Reports</h2>
                  <p className="text-xs text-[#78847D]">Items you have reported missing</p>
                </div>
                <button
                  onClick={() => onNavigate('report-lost')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
                >
                  + Report Lost Item
                </button>
              </div>

              {myLostItems.length === 0 ? (
                <div className="text-center py-12 text-[#78847D] text-xs">
                  <p className="font-semibold text-[#202B25] text-sm mb-1">No lost items reported</p>
                  <p>When you report something missing, you can track it here.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8F5EC]">
                  {myLostItems.map((item) => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image_urls[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100'}
                          alt={item.item_name}
                          className="w-14 h-14 rounded-xl object-cover border shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#202B25] truncate">{item.item_name}</h4>
                          <p className="text-xs text-[#78847D] truncate">Last seen: {item.location} on {item.date_reported}</p>
                          <span className="text-[11px] font-semibold text-[#238B57] bg-[#E8F5EC] px-2 py-0.5 rounded-full inline-block mt-1">
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onViewItem(item.id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#202B25] hover:bg-[#E8F5EC] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#238B57]" /> View
                        </button>
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#202B25] hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY FOUND REPORTS TAB */}
          {activeTab === 'found-reports' && (
            <div className="bg-white rounded-2xl border border-[#E8F5EC] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#202B25]">My Found Item Listings</h2>
                  <p className="text-xs text-[#78847D]">Items you have found and are safeguarding for owners</p>
                </div>
                <button
                  onClick={() => onNavigate('report-found')}
                  className="px-4 py-2 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl text-xs font-semibold"
                >
                  + Report Found Item
                </button>
              </div>

              {myFoundItems.length === 0 ? (
                <div className="text-center py-12 text-[#78847D] text-xs">
                  <p className="font-semibold text-[#202B25] text-sm mb-1">No found items reported</p>
                  <p>Found something? Help return it to its rightful owner.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8F5EC]">
                  {myFoundItems.map((item) => {
                    const itemClaims = claimsReceived.filter((c) => c.item_id === item.id);
                    return (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image_urls[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100'}
                            alt={item.item_name}
                            className="w-14 h-14 rounded-xl object-cover border shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#202B25] truncate">{item.item_name}</h4>
                            <p className="text-xs text-[#78847D] truncate">Found at: {item.location} on {item.date_reported}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-semibold text-[#238B57] bg-[#E8F5EC] px-2 py-0.5 rounded-full">
                                {item.status.toUpperCase()}
                              </span>
                              {itemClaims.length > 0 && (
                                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                  {itemClaims.length} Claims Received
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => onViewItem(item.id)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#202B25] hover:bg-[#E8F5EC] flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#238B57]" /> View
                          </button>
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#202B25] hover:bg-gray-50 flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CLAIMS RECEIVED TAB (Finder Reviews Evidence) */}
          {activeTab === 'claims-received' && (
            <div className="bg-white rounded-2xl border border-[#E8F5EC] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#202B25]">Claims Received (Ownership Verification)</h2>
                <p className="text-xs text-[#78847D]">
                  Review image evidence and secret details submitted by potential owners for items you found.
                </p>
              </div>

              {claimsReceived.length === 0 ? (
                <div className="text-center py-12 text-[#78847D] text-xs">
                  <ShieldCheck className="w-8 h-8 text-[#238B57] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-[#202B25] text-sm mb-1">No claims received yet</p>
                  <p>When someone claims an item you found, their ownership evidence will appear here for side-by-side review.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8F5EC]">
                  {claimsReceived.map((claim) => (
                    <div key={claim.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#202B25]">
                              {claim.item?.item_name || 'Found Item'}
                            </h4>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-xs text-[#78847D] mt-0.5">
                            Claimant: <strong>{claim.claimant?.full_name || 'User'}</strong> • Submitted {new Date(claim.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedClaimForReview(claim);
                            setReviewModalOpen(true);
                          }}
                          className="px-4 py-2 bg-[#238B57] hover:bg-[#1b6d44] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Review Evidence Side-by-Side</span>
                        </button>
                      </div>

                      {/* Snippet of description */}
                      <p className="text-xs text-[#202B25] bg-[#F9FBF9] p-3 rounded-xl border border-[#E8F5EC] leading-relaxed line-clamp-2">
                        "{claim.evidence_description}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CLAIMS SUBMITTED TAB (Claimant Tracks Status) */}
          {activeTab === 'claims-submitted' && (
            <div className="bg-white rounded-2xl border border-[#E8F5EC] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#202B25]">My Submitted Claims</h2>
                <p className="text-xs text-[#78847D]">
                  Track the verification status of claims you submitted for items you lost.
                </p>
              </div>

              {claimsSubmitted.length === 0 ? (
                <div className="text-center py-12 text-[#78847D] text-xs">
                  <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-[#202B25] text-sm mb-1">No claims submitted</p>
                  <p>When you see your missing item in the Found directory, click "Claim This Item" to submit proof.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8F5EC]">
                  {claimsSubmitted.map((claim) => (
                    <div key={claim.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#202B25]">
                              {claim.item?.item_name || 'Claimed Item'}
                            </h4>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-xs text-[#78847D] mt-0.5">
                            Reported by Finder: {claim.item?.location} • Submitted {new Date(claim.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewItem(claim.item_id)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-[#202B25] hover:bg-gray-50 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#238B57]" /> View Item
                          </button>
                          <button
                            onClick={() => setActiveTab('messages')}
                            className="px-3.5 py-1.5 bg-[#E8F5EC] text-[#238B57] rounded-lg text-xs font-semibold hover:bg-[#d5ecdc] flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Message Finder
                          </button>
                        </div>
                      </div>

                      {claim.rejection_reason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                          <strong>Finder's Reason:</strong> {claim.rejection_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="h-[650px]">
              <ChatWindow
                currentUser={currentUser}
                onViewItem={onViewItem}
              />
            </div>
          )}

          {/* PROFILE SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-[#E8F5EC] p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#202B25]">Profile & Account Settings</h2>
                <p className="text-xs text-[#78847D]">Update your personal information and contact preferences.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                    Phone Number (Private)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
                  />
                  <p className="text-[11px] text-[#78847D] mt-1">Never shown publicly on listings.</p>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Side-by-Side Review Evidence Modal */}
      {selectedClaimForReview && (
        <EvidenceReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedClaimForReview(null);
          }}
          claim={selectedClaimForReview}
          onStatusUpdated={loadDashboardData}
          onOpenChatWithClaimant={() => setActiveTab('messages')}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <Modal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title={`Edit ${editingItem.item_type === 'found' ? 'Found' : 'Lost'} Item Listing`}
        >
          <form onSubmit={handleSaveEditItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                Item Title
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as Item['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
              >
                <option value="open">Open (Active)</option>
                <option value="claimed">Claim Under Review</option>
                <option value="resolved">Resolved (Returned to Owner)</option>
                <option value="closed">Closed / Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                required
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F9FBF9]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8F5EC]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-medium text-[#78847D] hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#238B57] hover:bg-[#1b6d44] text-white text-xs font-semibold rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

