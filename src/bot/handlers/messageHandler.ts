import { Message } from 'wechaty';
import { getConfig, BotConfig } from '../config';
import { generateText as generateOpenAiText } from '../services/llm/openaiService';
import { generateText as generateGeminiText } from '../services/llm/geminiService';
import { handleCustomReply } from '../services/customReply';
import logger from '../../utils/logger';

const config: BotConfig = getConfig();
let userPrompt: string[] = [];

export async function onMessage(message: Message) {
  if (message.self()) {
    return;
  }

  const botName = message.wechaty.userSelf().name();
  const text = message.text().trim();
  const contact = message.from();
  const room = message.room();

  // 区分联系人和群组
  const isGroupMessage = !!room;
  const isMentioned = isGroupMessage ? await message.mentionSelf() : false;
  const mentionText = isGroupMessage ? text.replace(new RegExp(`@${botName}`, 'g'), '').trim() : text;

  logger.info(`Received message: ${text} from ${contact?.name() || 'unknown'} in ${isGroupMessage ? 'group' : 'private chat'}`);

  // 需要以指定关键词开始才会进行回复，关键词为空时就不需要
  const keywords = config.replyKeywords || [];
  const startsWithKeyword = keywords.length === 0 || keywords.some(keyword => mentionText.startsWith(keyword));

  if (!startsWithKeyword) {
    return;
  }

  // 群组聊天时需要@机器人微信名才能进行响应
  if (isGroupMessage && !isMentioned) {
    return;
  }

  // 记录触发的关键词
  const triggeredKeyword = keywords.find(keyword => mentionText.startsWith(keyword));
  if (triggeredKeyword) {
    logger.info(`Trigger keyword: ${triggeredKeyword}`);
  }

  // 自定义回复逻辑
  if (await handleCustomReply(message)) {
    return;
  }

  // 清除user prompt逻辑
  if (mentionText === '重置') {
    userPrompt = [];
    await message.say('已重置用户提示。');
    logger.info('User prompt reset');
    return;
  }

  // 将字段写进prompt
  userPrompt.push(mentionText);

  // 根据模型名称调用相应的 LLM API
  try {
    let reply = '';
    const model = config.model;

    if (model.startsWith('gpt')) {
      reply = await generateOpenAiText(userPrompt.join('\n'), model);
      logger.info(`Using model: ${model}`);
    } else if (model.startsWith('gemini')) {
      reply = await generateGeminiText(userPrompt.join('\n'), model);
      logger.info(`Using model: ${model}`);
    } else {
      reply = await generateOpenAiText(userPrompt.join('\n'), 'gpt-4o'); // 默认使用gpt-4o
      logger.info('Using default model: gpt-4o');
    }

    await message.say(reply);
    logger.info(`Replied to message from ${contact?.name() || 'unknown'} in ${isGroupMessage ? 'group' : 'private chat'}`);
  } catch (error) {
    logger.error('Error handling message:', error);
    await message.say('处理请求时出错，请稍后再试。');
  }
}