import React, { useState } from 'react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { SEED_USERS } from '../../mock/seedData';
import { 
  Search, 
  PlusCircle, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  unreadCount: number;
  activePage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  unreadCount,
  activePage,
  onNavigate,
  onOpenAuth,
  onOpenChat,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'lost', label: 'Lost Items' },
    { id: 'found', label: 'Found Items' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await authService.logout();
    onNavigate('home');
  };

  const handleSwitchDemoUser = (userId: string) => {
    authService.switchDemoUser(userId);
    setDemoMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8F5EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#238B57] flex items-center justify-center text-white shadow-md shadow-[#238B57]/20 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#202B25] font-heading flex items-center gap-1">
                  FindIt
                  <span className="w-2 h-2 rounded-full bg-[#238B57]"></span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#78847D] tracking-wider block -mt-1">
                  Lost & Found
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activePage === link.id
                      ? 'text-[#238B57] bg-[#E8F5EC]'
                      : 'text-[#202B25] hover:text-[#238B57] hover:bg-[#F9FBF9]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Quick Demo Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#E8F5EC] text-[#238B57] hover:bg-[#d5ecdc] transition-all border border-[#238B57]/20 cursor-pointer"
                title="Switch between demo personas to test claim verification and chat"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#238B57]" />
                <span className="max-w-[120px] truncate">
                  Demo: {currentUser ? currentUser.full_name.split(' ')[0] : 'Visitor'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#238B57]" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E8F5EC] p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <div className="px-2 py-1.5 border-b border-[#E8F5EC] mb-1">
                    <p className="text-[11px] font-semibold text-[#78847D] uppercase tracking-wider">
                      Switch Role for Testing
                    </p>
                  </div>
                  {SEED_USERS.map((u) => {
                    const isCurrent = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchDemoUser(u.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                          isCurrent ? 'bg-[#E8F5EC] text-[#238B57]' : 'hover:bg-[#F9FBF9] text-[#202B25]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={u.avatar_url}
                            alt={u.full_name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{u.full_name}</p>
                            <p className="text-[10px] text-[#78847D]">
                              {u.id === 'user-alex'
                                ? 'Finder (Sony Headphones)'
                                : u.id === 'user-sarah'
                                ? 'Claimant (Backpack)'
                                : 'Finder (BMW Keys)'}
                            </p>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-[#238B57]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Report Item Dropdown */}
            <div className="relative">
              <button
                onClick={() => setReportMenuOpen(!reportMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-[#238B57]/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Item</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {reportMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E8F5EC] p-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setReportMenuOpen(false)}
                >
                  <button
                    onClick={() => onNavigate('report-lost')}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E8F5EC] text-sm text-[#202B25] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <div>
                      <p className="font-semibold text-xs text-[#202B25]">Report Lost Item</p>
                      <p className="text-[11px] text-[#78847D]">You lost something missing</p>
                    </div>
                  </button>
                  <button
                    onClick={() => onNavigate('report-found')}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E8F5EC] text-sm text-[#202B25] flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#238B57]"></div>
                    <div>
                      <p className="font-semibold text-xs text-[#202B25]">Report Found Item</p>
                      <p className="text-[11px] text-[#78847D]">You found somebody's item</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Messaging icon with unread badge */}
            {currentUser && (
              <button
                onClick={onOpenChat}
                className="relative p-2.5 rounded-xl text-[#202B25] hover:text-[#238B57] hover:bg-[#E8F5EC] transition-all cursor-pointer"
                title="Open Messages"
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#238B57] text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile or Auth Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-gray-200 hover:border-[#238B57]/40 bg-white transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[#202B25] max-w-[100px] truncate">
                    {currentUser.full_name}
                  </span>
                  <img
                    src={currentUser.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.full_name}`}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-lg object-cover bg-[#E8F5EC]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#78847D]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8F5EC] p-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#E8F5EC] mb-1">
                      <p className="text-xs font-semibold text-[#202B25] truncate">{currentUser.full_name}</p>
                      <p className="text-[11px] text-[#78847D] truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#E8F5EC] text-xs font-medium text-[#202B25] flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#238B57]" />
                      Dashboard & Claims
                    </button>

                    <button
                      onClick={() => onNavigate('dashboard', { tab: 'claims-received' })}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#E8F5EC] text-xs font-medium text-[#202B25] flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#238B57]" />
                      Review Claims
                    </button>

                    <button
                      onClick={() => onNavigate('dashboard', { tab: 'messages' })}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#E8F5EC] text-xs font-medium text-[#202B25] flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#238B57]" />
                      Messages
                    </button>

                    <div className="border-t border-[#E8F5EC] my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-xs font-medium text-red-600 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-sm font-medium text-[#202B25] hover:text-[#238B57] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 bg-[#202B25] hover:bg-[#202B25]/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <button
                onClick={onOpenChat}
                className="relative p-2 rounded-lg text-[#202B25] bg-[#E8F5EC]"
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5 text-[#238B57]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#238B57] text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#202B25] hover:bg-[#E8F5EC] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8F5EC] bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  activePage === link.id
                    ? 'text-[#238B57] bg-[#E8F5EC]'
                    : 'text-[#202B25] hover:bg-[#F9FBF9]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#E8F5EC] flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigate('report-lost');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-amber-500 text-white rounded-xl font-medium text-sm text-center"
            >
              Report Lost Item
            </button>
            <button
              onClick={() => {
                onNavigate('report-found');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-[#238B57] text-white rounded-xl font-medium text-sm text-center"
            >
              Report Found Item
            </button>

            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 border border-[#238B57] text-[#238B57] rounded-xl font-medium text-sm text-center flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard ({currentUser.full_name})
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-xs text-red-600 text-center font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 border border-gray-300 rounded-xl text-sm font-medium text-[#202B25] text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 bg-[#202B25] text-white rounded-xl text-sm font-medium text-center"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

