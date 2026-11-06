export type ItemType = 'lost' | 'found';

export type ItemStatus = 'open' | 'claimed' | 'resolved' | 'closed';

export type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type ItemCategory =
  | 'Electronics'
  | 'Wallets & Purses'
  | 'Keys'
  | 'Bags & Backpacks'
  | 'Documents & IDs'
  | 'Jewelry & Watches'
  | 'Clothing & Accessories'
  | 'Pets'
  | 'Books & Notebooks'
  | 'Other';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  contact_preference?: 'chat' | 'email' | 'phone';
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  item_name: string;
  category: ItemCategory;
  description: string;
  location: string;
  date_reported: string; // ISO date string (YYYY-MM-DD)
  item_type: ItemType;
  image_urls: string[];
  status: ItemStatus;
  additional_details?: string;
  contact_preference?: 'chat' | 'email' | 'phone';
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  evidence_image_urls: string[];
  evidence_description: string;
  secret_details?: string;
  status: ClaimStatus;
  reviewer_id: string; // The person who found the item
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  claimant?: User;
  item?: Item;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  attachment_url?: string;
  created_at: string;
  read_at?: string | null;
}

export interface Conversation {
  id: string;
  item_id: string;
  claim_id?: string;
  claimant_id: string;
  finder_id: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
  item?: Item;
  claimant?: User;
  finder?: User;
  unread_count?: number;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'newest' | 'oldest';
  status: string;
}

