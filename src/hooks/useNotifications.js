// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { subscribeToUnreadCount } from '../services/notifications';
import { useAuth } from './useAuth';

/**
 * Hook to get unread notification count
 * Usage: const { unreadCount } = useNotifications();
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToUnreadCount(user.uid, (result) => {
      if (result.success) {
        setUnreadCount(result.data);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { unreadCount };
};
