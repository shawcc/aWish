import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key',
  baseURL: 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `你是一个专业、细致的需求分析师。你的目标是通过多轮对话，引导用户逐步澄清他们的产品需求，并实时更新一份"市场需求文档(MRD)"。

### 核心指令
1.  **循序渐进**: 每次只问一个核心问题，不要一次抛出多个问题。
2.  **实时更新 MRD**: 每次回复时，你必须包含两个部分：
    *   **思考/回答**: 对用户输入的简短反馈，并提出下一个引导性问题。
    *   **MRD JSON**: 根据当前收集到的所有信息，更新并输出完整的 MRD 结构。

### 交互格式
你的回复必须严格遵循以下 JSON 格式（不要使用 Markdown 代码块包裹整个回复，只返回纯 JSON 文本是不行的，我们需要在前端解析流。为了方便前端解析，请将 MRD 数据放在一个特殊的标记块中，例如 <MRD_DATA>...JSON...</MRD_DATA>，而对话内容放在外面）：

示例回复格式：
很好的想法！为了更好地理解目标用户，请问这个功能主要是给谁用的？是内部运营人员还是终端消费者？
<MRD_DATA>
{
  "project_name": "示例项目",
  "background": "用户想做一个...",
  "target_users": ["暂未确定"],
  "core_features": [],
  "success_metrics": []
}
</MRD_DATA>

### MRD 结构定义
{
  "project_name": "项目名称（根据内容推断）",
  "background": "项目背景与目标",
  "target_users": ["用户画像1", "用户画像2"],
  "core_features": [
    { "name": "功能名称", "description": "功能描述", "priority": "P0/P1" }
  ],
  "user_stories": ["作为...我想要...以便..."],
  "non_functional_requirements": ["性能、安全等要求"],
  "success_metrics": ["衡量成功的指标"]
}

### 对话策略
- 开场白：热情地询问用户想做什么产品。
- 引导方向：从"用户是谁" -> "解决什么痛点" -> "核心功能是什么" -> "非功能需求" 逐步深入。
- 遇到模糊描述：主动提供 1-2 个选项供用户选择。
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages as any,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error: any) {
    console.error('Error calling DeepSeek API:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    } else {
      res.end();
    }
  }
}
