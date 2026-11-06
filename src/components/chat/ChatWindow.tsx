import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User } from '../../types';
import { chatService } from '../../services/chatService';
import { ImageLightbox } from '../common/ImageLightbox';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  ShieldAlert, 
  Check, 
  CheckCheck, 
  X, 
  User as UserIcon,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface ChatWindowProps {
  currentUser: User;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onClose?: () => void;
  onViewItem?: (itemId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  activeConversationId,
  onSelectConversation,
  onClose,
  onViewItem,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | undefined>(activeConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations
  useEffect(() => {
    const loadData = () => {
      const convs = chatService.getUserConversations(currentUser.id);
      setConversations(convs);

      if (!selectedConvId && convs.length > 0) {
        setSelectedConvId(convs[0].id);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [currentUser.id, selectedConvId]);

  // Update selected conversation if prop changes
  useEffect(() => {
    if (activeConversationId) {
      setSelectedConvId(activeConversationId);
    }
  }, [activeConversationId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) return;

    const loadMessages = () => {
      const msgs = chatService.getMessages(selectedConvId);
      setMessages(msgs);
      chatService.markConversationAsRead(selectedConvId, currentUser.id);
    };

    loadMessages();
    const timer = setInterval(loadMessages, 2500);
    return () => clearInterval(timer);
  }, [selectedConvId, currentUser.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  // Other party in chat
  const otherParty = activeConv
    ? activeConv.claimant_id === currentUser.id
      ? activeConv.finder
      : activeConv.claimant
    : null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConvId || (!inputText.trim() && !attachment)) return;

    const text = inputText.trim();
    const attach = attachment;
    setInputText('');
    setAttachment(null);

    await chatService.sendMessage(selectedConvId, currentUser.id, text, attach || undefined);
    const updatedMessages = chatService.getMessages(selectedConvId);
    setMessages(updatedMessages);
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAttachment(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const quickReplies = [
    'Where is a safe public spot to meet?',
    'I can meet tomorrow afternoon around 3 PM.',
    'Thank you so much for finding this!',
    'I have arrived at the location.',
  ];

  return (
    <div className="flex h-full w-full bg-white rounded-2xl border border-[#E8F5EC] overflow-hidden shadow-md">
      
      {/* Conversations List Sidebar */}
      <div
        className={`w-full md:w-80 border-r border-[#E8F5EC] flex flex-col bg-[#F9FBF9] ${
          selectedConvId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-[#E8F5EC] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#202B25] text-base font-heading">Messages</h3>
            <p className="text-xs text-[#78847D]">Safe Handover Coordination</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#78847D] hover:text-[#202B25] hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E8F5EC]">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-[#78847D] text-xs">
              <p className="font-medium text-[#202B25] mb-1">No messages yet</p>
              <p>When you submit a claim or someone claims your found item, a secure chat is created here.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const partner = conv.claimant_id === currentUser.id ? conv.finder : conv.claimant;
              const isSelected = conv.id === selectedConvId;
              const hasUnread = (conv.unread_count || 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConvId(conv.id);
                    if (onSelectConversation) onSelectConversation(conv.id);
                  }}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected ? 'bg-white shadow-xs border-l-4 border-l-[#238B57]' : 'hover:bg-white/80'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={partner?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.full_name || 'U'}`}
                      alt={partner?.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-[#E8F5EC]"
                    />
                    {hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#238B57] rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-[#202B25] truncate">
                        {partner?.full_name || 'Partner'}
                      </span>
                      {conv.last_message_at && (
                        <span className="text-[10px] text-[#78847D]">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-[#238B57] truncate">
                      {conv.item?.item_name || 'Item Claim'}
                    </p>

                    <p className="text-xs text-[#78847D] truncate mt-0.5">
                      {conv.last_message || 'Start coordinating return...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 px-4 border-b border-[#E8F5EC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConvId(undefined)}
                  className="md:hidden p-1.5 rounded-lg text-[#78847D] hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={otherParty?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${otherParty?.full_name || 'U'}`}
                  alt={otherParty?.full_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-[#E8F5EC]"
                />

                <div>
                  <h4 className="text-sm font-bold text-[#202B25]">
                    {otherParty?.full_name || 'Chat Participant'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#78847D]">
                    <span>Item: <strong>{activeConv.item?.item_name}</strong></span>
                    {onViewItem && activeConv.item_id && (
                      <button
                        onClick={() => onViewItem(activeConv.item_id)}
                        className="text-[#238B57] hover:underline font-medium text-[11px]"
                      >
                        (View Item)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[#78847D] hover:text-[#202B25] hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Handover Safety Reminder */}
            <div className="p-2.5 px-4 bg-[#E8F5EC] border-b border-[#238B57]/20 flex items-center gap-2 text-xs text-[#202B25]">
              <ShieldAlert className="w-4 h-4 text-[#238B57] shrink-0" />
              <span>
                <strong>Safe Handover Reminder:</strong> Never share financial details. Agree on a public, well-lit place (police station lobby, cafe, campus entrance) for return.
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F9FBF9]">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-[#78847D] text-xs">
                  <p className="font-semibold text-[#202B25] text-sm mb-1">Begin Safe Return Coordination</p>
                  <p>Send a message below to greet each other and discuss meeting details.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUser.id;
                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] sm:max-w-md p-3.5 rounded-2xl shadow-xs text-sm leading-relaxed ${
                          isMine
                            ? 'bg-[#238B57] text-white rounded-br-xs'
                            : 'bg-white border border-[#E8F5EC] text-[#202B25] rounded-bl-xs'
                        }`}
                      >
                        {msg.attachment_url && (
                          <div
                            onClick={() => setLightboxImage(msg.attachment_url!)}
                            className="mb-2 rounded-xl overflow-hidden cursor-pointer max-h-48 group relative"
                          >
                            <img
                              src={msg.attachment_url}
                              alt="Attachment"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                              Click to view
                            </div>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.message_text}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-[#78847D] mt-1 px-1">
                        <span>{timeStr}</span>
                        {isMine && (
                          msg.read_at ? (
                            <CheckCheck className="w-3.5 h-3.5 text-[#238B57]" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-400" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 border-t border-[#E8F5EC] bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-[#78847D] font-medium shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#238B57]" /> Quick:
              </span>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputText(reply)}
                  className="shrink-0 px-2.5 py-1 text-xs rounded-full bg-[#E8F5EC] text-[#238B57] hover:bg-[#d5ecdc] transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Attachment preview if pending */}
            {attachment && (
              <div className="px-4 py-2 bg-gray-50 border-t border-[#E8F5EC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={attachment}
                    alt="Pending attachment"
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                  <span className="text-xs text-[#202B25] font-medium">Image attached</span>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3.5 px-4 bg-white border-t border-[#E8F5EC] flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttachment}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-[#78847D] hover:text-[#238B57] hover:bg-[#E8F5EC] transition-colors cursor-pointer"
                title="Attach an image"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/20 focus:border-[#238B57] text-sm text-[#202B25] bg-[#F9FBF9]"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !attachment}
                className="p-2.5 rounded-xl bg-[#238B57] hover:bg-[#1b6d44] text-white disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#78847D]">
            <div className="w-16 h-16 rounded-full bg-[#E8F5EC] text-[#238B57] flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#202B25] mb-1">Select a Conversation</h4>
            <p className="text-xs max-w-xs">
              Choose an item claim discussion from the list to message safely.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox for attachments */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
        altText="Chat attachment"
      />
    </div>
  );
};

