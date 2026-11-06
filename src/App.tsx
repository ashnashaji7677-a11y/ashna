import React, { useState, useEffect } from 'react';
import { User, Item, FilterOptions } from './types';
import { localStore } from './lib/storage';
import { authService } from './services/authService';
import { itemService } from './services/itemService';
import { chatService } from './services/chatService';

import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ChatDrawer } from './components/chat/ChatDrawer';

import { LandingPage } from './components/pages/LandingPage';
import { LostItemsPage } from './components/pages/LostItemsPage';
import { FoundItemsPage } from './components/pages/FoundItemsPage';
import { ReportLostPage } from './components/pages/ReportLostPage';
import { ReportFoundPage } from './components/pages/ReportFoundPage';
import { ItemDetailPage } from './components/pages/ItemDetailPage';
import { DashboardPage } from './components/pages/DashboardPage';

function MainApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(localStore.getCurrentUser());
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<string>('overview');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Global search filters transferred from landing page
  const [globalSearchFilters, setGlobalSearchFilters] = useState<Partial<FilterOptions>>({});

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeChatConvId, setActiveChatConvId] = useState<string | undefined>(undefined);

  // Items lists
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);

  // Refresh lists & subscribe to localStore changes
  const refreshData = () => {
    const user = localStore.getCurrentUser();
    setCurrentUser(user);
    setLostItems(itemService.getItems({}, 'lost'));
    setFoundItems(itemService.getItems({}, 'found'));
    if (user) {
      setUnreadCount(chatService.getTotalUnreadCount(user.id));
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = localStore.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  // Navigation handler
  const handleNavigate = (page: string, params?: Record<string, string>) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'dashboard' && !currentUser) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (params?.tab) {
      setDashboardTab(params.tab);
    }

    if (page === 'how-it-works') {
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    setActivePage(page);
  };

  const handleViewItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setActivePage('item-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalSearch = (query: string, category?: string) => {
    setGlobalSearchFilters({
      searchQuery: query,
      category: category || 'All',
    });
    // Default to found directory for searches
    setActivePage('found');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenChatWithUser = (convId?: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    setActiveChatConvId(convId);
    setChatDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBF9] text-[#202B25]">
      {/* Sticky Top Navigation */}
      <Navbar
        currentUser={currentUser}
        unreadCount={unreadCount}
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenChat={() => setChatDrawerOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activePage === 'home' && (
          <LandingPage
            lostItems={lostItems}
            foundItems={foundItems}
            onNavigate={handleNavigate}
            onViewItem={handleViewItem}
            onSearchGlobal={handleGlobalSearch}
          />
        )}

        {activePage === 'lost' && (
          <LostItemsPage
            onViewItem={handleViewItem}
            onReportLost={() => handleNavigate('report-lost')}
            initialFilters={globalSearchFilters}
          />
        )}

        {activePage === 'found' && (
          <FoundItemsPage
            onViewItem={handleViewItem}
            onReportFound={() => handleNavigate('report-found')}
            initialFilters={globalSearchFilters}
          />
        )}

        {activePage === 'report-lost' && (
          <ReportLostPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onItemCreated={(id) => handleViewItem(id)}
            onRequireAuth={() => handleOpenAuth('login')}
          />
        )}

        {activePage === 'report-found' && (
          <ReportFoundPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onItemCreated={(id) => handleViewItem(id)}
            onRequireAuth={() => handleOpenAuth('login')}
          />
        )}

        {activePage === 'item-detail' && selectedItemId && (
          <ItemDetailPage
            itemId={selectedItemId}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenChatWithUser={handleOpenChatWithUser}
            onRequireAuth={() => handleOpenAuth('login')}
          />
        )}

        {activePage === 'dashboard' && currentUser && (
          <DashboardPage
            currentUser={currentUser}
            initialTab={dashboardTab}
            onNavigate={handleNavigate}
            onViewItem={handleViewItem}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Integrated Chat Drawer / Slide-Over */}
      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => {
          setChatDrawerOpen(false);
          setActiveChatConvId(undefined);
        }}
        currentUser={currentUser}
        activeConversationId={activeChatConvId}
        onViewItem={handleViewItem}
        onRequireAuth={() => handleOpenAuth('login')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
