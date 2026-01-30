import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key',
  baseURL: 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `你是一个专业的需求分析师，帮助用户完整描述他们的产品需求。

你的任务：
1. 通过对话引导用户完整描述需求
2. 识别需求中的关键信息（功能、用户、场景等）
3. 在对话结束时生成结构化的需求总结
4. 用中文进行对话

对话要求：
- 主动询问用户需求的背景和目的
- 澄清模糊的需求描述
- 确保需求的完整性和可行性
- 最终输出包含：功能描述、用户角色、使用场景、验收标准`;

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
