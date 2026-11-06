import { Item, FilterOptions, ItemType } from '../types';
import { localStore } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const itemService = {
  getItems(filters?: Partial<FilterOptions>, type?: ItemType): Item[] {
    let items = localStore.getItems();

    if (type) {
      items = items.filter((i) => i.item_type === type);
    }

    if (!filters) return items;

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.item_name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.location && filters.location.trim()) {
      const loc = filters.location.toLowerCase().trim();
      items = items.filter((i) => i.location.toLowerCase().includes(loc));
    }

    if (filters.dateFrom) {
      items = items.filter((i) => i.date_reported >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      items = items.filter((i) => i.date_reported <= filters.dateTo!);
    }

    if (filters.status && filters.status !== 'All') {
      items = items.filter((i) => i.status === filters.status);
    }

    // Sort
    if (filters.sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.date_reported).getTime() - new Date(b.date_reported).getTime());
    } else {
      items.sort((a, b) => new Date(b.date_reported).getTime() - new Date(a.date_reported).getTime());
    }

    return items;
  },

  getItemById(id: string): Item | undefined {
    return localStore.getItemById(id);
  },

  async createItem(itemData: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
    const newItem: Item = {
      ...itemData,
      id: 'item-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').insert({
          id: newItem.id,
          user_id: newItem.user_id,
          item_name: newItem.item_name,
          category: newItem.category,
          description: newItem.description,
          location: newItem.location,
          date_reported: newItem.date_reported,
          item_type: newItem.item_type,
          image_urls: newItem.image_urls,
          status: newItem.status,
          additional_details: newItem.additional_details,
          contact_preference: newItem.contact_preference,
        });
      } catch (err) {
        console.warn('Supabase insert item error:', err);
      }
    }

    localStore.saveItem(newItem);
    return newItem;
  },

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    const existing = localStore.getItemById(id);
    if (!existing) return null;

    const updated: Item = { ...existing, ...updates };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update item error:', err);
      }
    }

    localStore.saveItem(updated);
    return updated;
  },

  async deleteItem(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('items').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete item error:', err);
      }
    }

    localStore.deleteItem(id);
    return true;
  },

  getUserItems(userId: string, type?: ItemType): Item[] {
    const items = localStore.getItems().filter((i) => i.user_id === userId);
    if (type) {
      return items.filter((i) => i.item_type === type);
    }
    return items;
  },

  // Helper to read file as Data URL
  readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
};

