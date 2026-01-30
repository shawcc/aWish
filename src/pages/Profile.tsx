import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        }

        if (data) {
          setProfile(data);
          setName(data.name || user.user_metadata.name || '');
        } else {
            // Fallback if profile doesn't exist yet
            setName(user.user_metadata.name || '');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ name, updated_at: new Date() })
        .eq('id', user?.id);

      if (error) throw error;
      setMessage('个人信息已更新');
      
      // Also update auth metadata
      await supabase.auth.updateUser({
        data: { name }
      });

    } catch (error: any) {
      setMessage(`更新失败: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">加载中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={updateProfile}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  邮箱
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>

              {message && (
                <div className={`text-sm ${message.includes('失败') ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                  {updating ? '保存中...' : '保存更改'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
