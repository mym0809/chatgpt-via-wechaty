import { getConfig, BotConfig } from '../config';
import { Message } from 'wechaty';
import logger from '../../utils/logger';

const config: BotConfig = getConfig();

interface CustomReply {
  trigger: string;
  response: string;
}

export async function handleCustomReply(message: Message): Promise<boolean> {
  const text = message.text().trim();
  const customReplies: CustomReply[] = config.customReplies || [];

  for (const reply of customReplies) {
    if (text === reply.trigger) {
      await message.say(reply.response);
      logger.info(`Custom reply triggered: ${reply.trigger}`);
      return true;
    }
  }

  return false;
}