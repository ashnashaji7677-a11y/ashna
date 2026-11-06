import React from 'react';
import { User } from '../../types';
import { ChatWindow } from './ChatWindow';
import { X } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeConversationId?: string;
  onViewItem?: (itemId: string) => void;
  onRequireAuth: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeConversationId,
  onViewItem,
  onRequireAuth,
}) => {
  if (!isOpen) return null;

  if (!currentUser) {
    onRequireAuth();
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#E8F5EC] overflow-hidden z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ChatWindow
          currentUser={currentUser}
          activeConversationId={activeConversationId}
          onClose={onClose}
          onViewItem={(id) => {
            onClose();
            if (onViewItem) onViewItem(id);
          }}
        />
      </div>
    </div>
  );
};

