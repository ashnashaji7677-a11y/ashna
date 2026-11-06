import { User } from '../types';
import { localStore } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  getCurrentUser(): User | null {
    return localStore.getCurrentUser();
  },

  async login(email: string, _password?: string): Promise<{ user: User | null; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password || 'password123',
        });
        if (error) return { user: null, error: error.message };
        if (data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const user: User = profile || {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            created_at: data.user.created_at,
          };
          localStore.setCurrentUser(user);
          return { user };
        }
      } catch (err: unknown) {
        console.warn('Supabase sign in failed, falling back to local mode:', err);
      }
    }

    // Local / Standalone Mode
    const users = localStore.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new user if not found
      user = {
        id: 'user-' + Date.now().toString(36),
        email,
        full_name: email.split('@')[0].replace('.', ' '),
        created_at: new Date().toISOString(),
      };
      localStore.saveUser(user);
    }

    localStore.setCurrentUser(user);
    return { user };
  },

  async signUp(fullName: string, email: string, password?: string): Promise<{ user: User | null; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || 'password123',
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) return { user: null, error: error.message };
        if (data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            created_at: data.user.created_at,
          };
          await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
          });
          localStore.setCurrentUser(user);
          return { user };
        }
      } catch (err: unknown) {
        console.warn('Supabase sign up failed, falling back to local mode:', err);
      }
    }

    // Local / Standalone Mode
    const users = localStore.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { user: null, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'user-' + Date.now().toString(36),
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    };

    localStore.saveUser(newUser);
    localStore.setCurrentUser(newUser);
    return { user: newUser };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStore.setCurrentUser(null);
  },

  switchDemoUser(userId: string): User | null {
    const user = localStore.getUserById(userId);
    if (user) {
      localStore.setCurrentUser(user);
      return user;
    }
    return null;
  },

  updateProfile(data: Partial<User>): User | null {
    const current = localStore.getCurrentUser();
    if (!current) return null;
    const updated: User = { ...current, ...data };
    localStore.saveUser(updated);
    localStore.setCurrentUser(updated);
    return updated;
  },
};

