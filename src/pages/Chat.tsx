import { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mrdData, setMrdData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  // ... (keep existing state)

  // Helper to extract MRD data from content
  const extractMrdData = (content: string) => {
    const match = content.match(/<MRD_DATA>([\s\S]*?)<\/MRD_DATA>/);
    if (match && match[1]) {
      try {
        const json = JSON.parse(match[1]);
        setMrdData(json);
        // Return content without the MRD block for display
        return content.replace(/<MRD_DATA>[\s\S]*?<\/MRD_DATA>/, '').trim();
      } catch (e) {
        console.error('Failed to parse MRD JSON', e);
      }
    }
    return content;
  };

  const [saving, setSaving] = useState(false);

  // ... (keep existing sendMessage function)

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = { role: 'assistant', content: '', fullContent: '' };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const { content } = JSON.parse(data);
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                
                // Update full content
                lastMessage.fullContent = (lastMessage.fullContent || '') + content;
                
                // Extract MRD and update clean content
                const cleanContent = extractMrdData(lastMessage.fullContent);
                lastMessage.content = cleanContent;
                
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!mrdData || !user) return;
    
    // 如果没有项目名称，提示用户
    if (!mrdData.project_name) {
      alert('AI 尚未生成足够的需求信息，请继续对话补充细节。');
      return;
    }

    setSaving(true);
    try {
      // 1. Create Conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: mrdData.project_name,
          status: 'completed'
        })
        .select()
        .single();

      if (convError) throw convError;

      // 2. Save Messages
      const messagesToSave = messages.map(msg => ({
        conversation_id: conversation.id,
        sender_type: msg.role === 'assistant' ? 'ai' : 'user',
        content: msg.content
      }));

      const { error: msgError } = await supabase
        .from('messages')
        .insert(messagesToSave);

      if (msgError) throw msgError;

      // 3. Create Requirement
      const { error: reqError } = await supabase
        .from('requirements')
        .insert({
          user_id: user.id,
          conversation_id: conversation.id,
          title: mrdData.project_name,
          description: mrdData.background,
          status: 'pending',
          summary: mrdData
        });

      if (reqError) throw reqError;

      // Redirect to requirements list
      navigate('/requirements');
      
    } catch (error) {
      console.error('Error saving requirement:', error);
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Side: Chat */}
      <div className="w-1/2 flex flex-col border-r border-gray-200">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <h3 className="text-lg font-medium">开始新的需求对话</h3>
              <p className="mt-2">告诉我您的想法，AI 将帮您梳理成右侧的 MRD 文档。</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[90%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 shadow-sm rounded-bl-none'
                } rounded-2xl px-4 py-2`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' && (
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                        AI
                      </div>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
              <div className="flex justify-start">
                  <div className="bg-white text-gray-900 shadow-sm rounded-2xl rounded-bl-none px-4 py-2">
                       <span className="animate-pulse">AI 正在思考...</span>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={sendMessage} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入您的需求..."
              className="block w-full rounded-full border-0 py-4 pl-4 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              disabled={loading || saving}
            />
            <button
              type="submit"
              disabled={loading || saving || !input.trim()}
              className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Live MRD */}
      <div className="w-1/2 flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-xl font-bold text-gray-900">实时需求文档 (MRD)</h2>
              <p className="text-sm text-gray-500">AI 将根据对话自动更新此文档</p>
          </div>
          
          {mrdData ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">项目概况</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900">{mrdData.project_name || '未命名项目'}</h4>
                  <p className="mt-2 text-gray-600 text-sm">{mrdData.background || '待补充...'}</p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">目标用户</h3>
                <div className="flex flex-wrap gap-2">
                  {mrdData.target_users?.map((user: string, i: number) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {user}
                    </span>
                  )) || <span className="text-gray-400 text-sm">待确认</span>}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">核心功能</h3>
                <div className="space-y-3">
                  {mrdData.core_features?.map((feature: any, i: number) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-900">{feature.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${feature.priority === 'P0' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {feature.priority || 'P?'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                    </div>
                  )) || <div className="text-gray-400 text-sm italic">暂无功能描述</div>}
                </div>
              </section>

               <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">用户故事</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {mrdData.user_stories?.map((story: string, i: number) => (
                     <li key={i} className="text-sm text-gray-600">{story}</li>
                  )) || <li className="text-gray-400 text-sm italic list-none">待挖掘</li>}
                </ul>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-center">
                  <p>文档为空</p>
                  <p className="text-sm mt-1">开始对话后自动生成</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Finish Button Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleFinish}
            disabled={!mrdData || saving}
            className="rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '正在提交...' : '确认并提交需求'}
          </button>
        </div>
      </div>
    </div>
  );
}
