import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    // Only fetch if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await api.get('/notifications');
      const notifications = response.data;
      const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;
      
      set({ 
        notifications, 
        unreadCount,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const newNotifications = state.notifications.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        );
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(n => !n.is_read).length
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.post('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  }
}));
