import { Link } from 'react-router-dom';
import { MessageSquareText, ClipboardList, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              AI 智能需求助手
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              通过自然语言对话，轻松描述您的产品需求。AI 将协助您梳理细节，生成规范文档，并实时跟踪需求状态。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/chat"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                开始需求对话
              </Link>
              <Link to="/requirements" className="text-sm font-semibold leading-6 text-gray-900">
                查看历史需求 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">更高效的沟通</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            智能化需求管理流程
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <MessageSquareText className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                智能对话引导
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">AI 助手主动引导提问，挖掘需求细节，确保需求描述的完整性和准确性。</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <ClipboardList className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                自动生成文档
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">对话结束后自动生成结构化的需求文档，包含功能点、用户角色和验收标准。</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Bell className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                实时状态通知
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">需求状态更新时自动推送通知，让您随时掌握需求处理进度。</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
