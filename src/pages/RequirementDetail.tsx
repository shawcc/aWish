import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ArrowLeftIcon } from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  status: string;
  summary: any;
  created_at: string;
}

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'bg-yellow-100 text-yellow-800' },
  reviewing: { text: '审核中', color: 'bg-blue-100 text-blue-800' },
  approved: { text: '已通过', color: 'bg-green-100 text-green-800' },
  rejected: { text: '已拒绝', color: 'bg-red-100 text-red-800' },
  implemented: { text: '已实现', color: 'bg-purple-100 text-purple-800' },
};

export default function RequirementDetail() {
  const { id } = useParams<{ id: string }>();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRequirement(id);
    }
  }, [id]);

  const fetchRequirement = async (reqId: string) => {
    try {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', reqId)
        .single();

      if (error) throw error;
      setRequirement(data);
    } catch (error) {
      console.error('Error fetching requirement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">加载中...</div>;
  }

  if (!requirement) {
    return <div className="p-10 text-center text-gray-500">需求未找到</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/requirements" className="text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">需求详情</h1>
      </div>

      <div className="bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">{requirement.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              提交于 {format(new Date(requirement.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold leading-5 ${
              statusMap[requirement.status]?.color || 'bg-gray-100 text-gray-800'
            }`}
          >
            {statusMap[requirement.status]?.text || requirement.status}
          </span>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">需求描述</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{requirement.description || '无详细描述'}</dd>
            </div>
            {requirement.summary && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">AI 总结</dt>
                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md">
                   <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(requirement.summary, null, 2)}</pre>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
