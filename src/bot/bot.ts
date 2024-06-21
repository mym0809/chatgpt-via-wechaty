import { WechatyBuilder } from 'wechaty';
import { getConfig, BotConfig } from './config';
import { onScan, onLogin, onLogout } from './handlers/eventHandler';
import { onMessage } from './handlers/messageHandler';
import { onFriendship } from './handlers/friendHandler';
import { startScheduler } from './services/scheduler';
import logger from '../utils/logger';

const config: BotConfig = getConfig();

export function createBot() {
  const bot = WechatyBuilder.build({
    name: config.botName,
    puppet: config.puppet as any // type assertion to bypass type error
  });

  bot.on('scan', onScan);
  bot.on('login', user => onLogin(user, bot));
  bot.on('logout', onLogout);
  bot.on('message', onMessage);
  bot.on('friendship', onFriendship);

  logger.info('Bot instance created');

  return bot;
}

export async function startBot(bot: any) {
  try {
    await bot.start();
    logger.info(`Bot started successfully. Bot name: ${bot.name()}`);
    startScheduler(); // 启动调度器
  } catch (error) {
    logger.error(`Bot failed to start: ${error}`);
  }
}

export async function stopBot(bot: any) {
  try {
    await bot.stop();
    logger.info('Bot stopped successfully');
  } catch (error) {
    logger.error(`Bot failed to stop: ${error}`);
  }
}