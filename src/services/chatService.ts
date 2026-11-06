import { Conversation, Message } from '../types';
import { localStore } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const chatService = {
  getUserConversations(userId: string): Conversation[] {
    return localStore.getConversationsForUser(userId);
  },

  getConversationById(convId: string): Conversation | undefined {
    return localStore.getConversations().find((c) => c.id === convId);
  },

  async getOrCreateConversation(
    itemId: string,
    claimantId: string,
    finderId: string,
    claimId?: string
  ): Promise<Conversation> {
    const existing = localStore
      .getConversations()
      .find(
        (c) =>
          c.item_id === itemId &&
          c.claimant_id === claimantId &&
          c.finder_id === finderId
      );

    if (existing) {
      if (claimId && !existing.claim_id) {
        existing.claim_id = claimId;
        localStore.saveConversation(existing);
      }
      return existing;
    }

    const newConv: Conversation = {
      id: 'conv-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      item_id: itemId,
      claim_id: claimId,
      claimant_id: claimantId,
      finder_id: finderId,
      created_at: new Date().toISOString(),
      last_message: 'Conversation initiated regarding item claim.',
      last_message_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('conversations').insert({
          id: newConv.id,
          item_id: newConv.item_id,
          claim_id: newConv.claim_id,
          claimant_id: newConv.claimant_id,
          finder_id: newConv.finder_id,
        });
      } catch (err) {
        console.warn('Supabase insert conversation error:', err);
      }
    }

    localStore.saveConversation(newConv);
    return newConv;
  },

  getMessages(conversationId: string): Message[] {
    return localStore.getMessagesForConversation(conversationId);
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    messageText: string,
    attachmentUrl?: string
  ): Promise<Message> {
    const newMessage: Message = {
      id: 'msg-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      conversation_id: conversationId,
      sender_id: senderId,
      message_text: messageText,
      attachment_url: attachmentUrl,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert({
          id: newMessage.id,
          conversation_id: newMessage.conversation_id,
          sender_id: newMessage.sender_id,
          message_text: newMessage.message_text,
          attachment_url: newMessage.attachment_url,
        });
      } catch (err) {
        console.warn('Supabase insert message error:', err);
      }
    }

    localStore.saveMessage(newMessage);
    return newMessage;
  },

  markConversationAsRead(conversationId: string, currentUserId: string): void {
    localStore.markMessagesAsRead(conversationId, currentUserId);
  },

  getTotalUnreadCount(userId: string): number {
    const conversations = this.getUserConversations(userId);
    return conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
  },
};

