import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">通知中心</h1>

      <div className="bg-white shadow sm:rounded-md overflow-hidden">
        <ul role="list" className="divide-y divide-gray-200">
          {loading ? (
             <div className="p-4 text-center text-gray-500">加载中...</div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              暂无通知
            </div>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id} className={`p-4 hover:bg-gray-50 ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Bell className={`h-6 w-6 ${notification.is_read ? 'text-gray-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${notification.is_read ? 'text-gray-900' : 'text-blue-600'}`}>
                      {notification.content}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(notification.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="flex-shrink-0 self-center">
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        标记已读
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
