import { create } from 'zustand';
import api from '../lib/api';
import { Notification } from '../types';
import { toast } from 'react-hot-toast';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/api/client/notifications');
      const newNotifications = response.data || [];
      
      // Check for new unread notifications to show toast
      const currentNotifications = get().notifications;
      const newUnread = newNotifications.filter(
        (n: Notification) => !n.read && !currentNotifications.find(cn => cn.id === n.id)
      );

      if (newUnread.length > 0) {
        newUnread.forEach((n: Notification) => {
          toast.success(n.title, {
            icon: '🔔',
          });
        });
      }

      set({ 
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n: Notification) => !n.read).length,
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.put(`/api/client/notifications/${id}/read`);
      const updatedNotifications = get().notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      set({ 
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/api/client/notifications/read-all');
      const updatedNotifications = get().notifications.map(n => ({ ...n, read: true }));
      set({ 
        notifications: updatedNotifications,
        unreadCount: 0
      });
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },
}));

// Polling every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useNotificationStore.getState();
    store.fetchNotifications();
  }, 30000);
}
