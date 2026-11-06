import { User, Item, Claim, Conversation, Message } from '../types';
import { SEED_USERS, SEED_ITEMS, SEED_CLAIMS, SEED_CONVERSATIONS, SEED_MESSAGES } from '../mock/seedData';

type Listener = () => void;

class StorageStore {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (!localStorage.getItem('findit_users')) {
      localStorage.setItem('findit_users', JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem('findit_items')) {
      localStorage.setItem('findit_items', JSON.stringify(SEED_ITEMS));
    }
    if (!localStorage.getItem('findit_claims')) {
      localStorage.setItem('findit_claims', JSON.stringify(SEED_CLAIMS));
    }
    if (!localStorage.getItem('findit_conversations')) {
      localStorage.setItem('findit_conversations', JSON.stringify(SEED_CONVERSATIONS));
    }
    if (!localStorage.getItem('findit_messages')) {
      localStorage.setItem('findit_messages', JSON.stringify(SEED_MESSAGES));
    }
    if (!localStorage.getItem('findit_current_user')) {
      // Default to Alex Turner (Finder) or Sarah Connor
      localStorage.setItem('findit_current_user', JSON.stringify(SEED_USERS[0]));
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public resetToSeed() {
    localStorage.setItem('findit_users', JSON.stringify(SEED_USERS));
    localStorage.setItem('findit_items', JSON.stringify(SEED_ITEMS));
    localStorage.setItem('findit_claims', JSON.stringify(SEED_CLAIMS));
    localStorage.setItem('findit_conversations', JSON.stringify(SEED_CONVERSATIONS));
    localStorage.setItem('findit_messages', JSON.stringify(SEED_MESSAGES));
    localStorage.setItem('findit_current_user', JSON.stringify(SEED_USERS[0]));
    this.notify();
  }

  // Current User
  public getCurrentUser(): User | null {
    const raw = localStorage.getItem('findit_current_user');
    return raw ? JSON.parse(raw) : null;
  }

  public setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem('findit_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('findit_current_user');
    }
    this.notify();
  }

  // Users
  public getUsers(): User[] {
    const raw = localStorage.getItem('findit_users');
    return raw ? JSON.parse(raw) : [];
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public saveUser(user: User) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('findit_users', JSON.stringify(users));
    this.notify();
  }

  // Items
  public getItems(): Item[] {
    const raw = localStorage.getItem('findit_items');
    const items: Item[] = raw ? JSON.parse(raw) : [];
    const users = this.getUsers();
    return items.map((item) => {
      const user = users.find((u) => u.id === item.user_id);
      return {
        ...item,
        user: user
          ? {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              avatar_url: user.avatar_url,
            }
          : undefined,
      };
    });
  }

  public getItemById(id: string): Item | undefined {
    return this.getItems().find((i) => i.id === id);
  }

  public saveItem(item: Item) {
    const raw = localStorage.getItem('findit_items');
    const items: Item[] = raw ? JSON.parse(raw) : [];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem('findit_items', JSON.stringify(items));
    this.notify();
  }

  public deleteItem(id: string) {
    const raw = localStorage.getItem('findit_items');
    const items: Item[] = raw ? JSON.parse(raw) : [];
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem('findit_items', JSON.stringify(filtered));
    this.notify();
  }

  // Claims
  public getClaims(): Claim[] {
    const raw = localStorage.getItem('findit_claims');
    const claims: Claim[] = raw ? JSON.parse(raw) : [];
    const users = this.getUsers();
    const items = this.getItems();
    return claims.map((claim) => ({
      ...claim,
      claimant: users.find((u) => u.id === claim.claimant_id),
      item: items.find((i) => i.id === claim.item_id),
    }));
  }

  public getClaimsByItemId(itemId: string): Claim[] {
    return this.getClaims().filter((c) => c.item_id === itemId);
  }

  public getClaimsByReviewerId(reviewerId: string): Claim[] {
    return this.getClaims().filter((c) => c.reviewer_id === reviewerId);
  }

  public getClaimsByClaimantId(claimantId: string): Claim[] {
    return this.getClaims().filter((c) => c.claimant_id === claimantId);
  }

  public saveClaim(claim: Claim) {
    const raw = localStorage.getItem('findit_claims');
    const claims: Claim[] = raw ? JSON.parse(raw) : [];
    const idx = claims.findIndex((c) => c.id === claim.id);
    if (idx >= 0) {
      claims[idx] = claim;
    } else {
      claims.unshift(claim);
    }
    localStorage.setItem('findit_claims', JSON.stringify(claims));
    this.notify();
  }

  // Conversations & Messages
  public getConversations(): Conversation[] {
    const raw = localStorage.getItem('findit_conversations');
    const conversations: Conversation[] = raw ? JSON.parse(raw) : [];
    const users = this.getUsers();
    const items = this.getItems();
    const messages = this.getMessages();

    return conversations.map((conv) => {
      const convMessages = messages.filter((m) => m.conversation_id === conv.id);
      const currentUser = this.getCurrentUser();
      const unreadCount = currentUser
        ? convMessages.filter((m) => m.sender_id !== currentUser.id && !m.read_at).length
        : 0;

      return {
        ...conv,
        item: items.find((i) => i.id === conv.item_id),
        claimant: users.find((u) => u.id === conv.claimant_id),
        finder: users.find((u) => u.id === conv.finder_id),
        unread_count: unreadCount,
      };
    });
  }

  public getConversationsForUser(userId: string): Conversation[] {
    return this.getConversations().filter(
      (c) => c.claimant_id === userId || c.finder_id === userId
    );
  }

  public saveConversation(conv: Conversation) {
    const raw = localStorage.getItem('findit_conversations');
    const conversations: Conversation[] = raw ? JSON.parse(raw) : [];
    const idx = conversations.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      conversations[idx] = conv;
    } else {
      conversations.unshift(conv);
    }
    localStorage.setItem('findit_conversations', JSON.stringify(conversations));
    this.notify();
  }

  public getMessages(): Message[] {
    const raw = localStorage.getItem('findit_messages');
    return raw ? JSON.parse(raw) : [];
  }

  public getMessagesForConversation(convId: string): Message[] {
    return this.getMessages().filter((m) => m.conversation_id === convId);
  }

  public saveMessage(message: Message) {
    const raw = localStorage.getItem('findit_messages');
    const messages: Message[] = raw ? JSON.parse(raw) : [];
    messages.push(message);
    localStorage.setItem('findit_messages', JSON.stringify(messages));

    // Update conversation last message
    const convs = this.getConversations();
    const conv = convs.find((c) => c.id === message.conversation_id);
    if (conv) {
      conv.last_message = message.message_text;
      conv.last_message_at = message.created_at;
      this.saveConversation(conv);
    }

    this.notify();
  }

  public markMessagesAsRead(convId: string, currentUserId: string) {
    const raw = localStorage.getItem('findit_messages');
    const messages: Message[] = raw ? JSON.parse(raw) : [];
    let updated = false;
    messages.forEach((m) => {
      if (m.conversation_id === convId && m.sender_id !== currentUserId && !m.read_at) {
        m.read_at = new Date().toISOString();
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem('findit_messages', JSON.stringify(messages));
      this.notify();
    }
  }
}

export const localStore = new StorageStore();

