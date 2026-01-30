import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Requirement {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  reviewing: { text: '审核中', color: 'bg-blue-100 text-blue-800' },
  approved: { text: '已通过', color: 'bg-green-100 text-green-800' },
  rejected: { text: '已拒绝', color: 'bg-red-100 text-red-800' },
  implemented: { text: '已实现', color: 'bg-purple-100 text-purple-800' },
};

export default function Requirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">需求管理</h1>
        <Link
          to="/chat"
          className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          新增需求
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {loading ? (
             <div className="p-4 text-center text-gray-500">加载中...</div>
          ) : requirements.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              暂无需求，快去<Link to="/chat" className="text-blue-600 hover:underline">提交一个</Link>吧！
            </div>
          ) : (
            requirements.map((req) => (
              <li key={req.id}>
                <Link to={`/requirements/${req.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-medium text-blue-600">{req.title}</p>
                      <div className="ml-2 flex flex-shrink-0">
                        <p
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            statusMap[req.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusMap[req.status]?.text || req.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          提交于 {format(new Date(req.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
