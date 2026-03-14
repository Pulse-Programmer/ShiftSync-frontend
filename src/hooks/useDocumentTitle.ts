import { useEffect } from 'react';
import { useUnreadCount } from './api/useNotifications';
import { useAuth } from './useAuth';

const BASE_TITLE = 'ShiftSync';

/**
 * Updates the browser tab title with unread notification count.
 * Mount once in the authenticated layout.
 */
export function useDocumentTitle() {
  const { user } = useAuth();
  const { data: unread } = useUnreadCount();

  useEffect(() => {
    if (!user) {
      document.title = BASE_TITLE;
      return;
    }

    const count = unread?.count ?? 0;
    document.title = count > 0 ? `(${count}) ${BASE_TITLE}` : BASE_TITLE;
  }, [user, unread]);
}
