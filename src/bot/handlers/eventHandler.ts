import { Contact, ScanStatus, Wechaty } from 'wechaty';
import logger from '../../utils/logger';
import { getConfig, BotConfig } from '../config';

const config: BotConfig = getConfig();

export function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    const qrcodeImageUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
    logger.info(`Scan QR Code to login: ${status}\n${qrcodeImageUrl}`);
  } else {
    logger.info(`Scan QR Code to login: ${status}`);
  }
}

export function onLogin(user: Contact, bot: Wechaty) {
  logger.info(`${user.name()} logged in`);
  
  // 打印扫码微信名
  logger.info(`Logged in as: ${user.name()}`);

  // 打印定时任务
  config.schedules.forEach((schedule: any) => {
    logger.info(`Scheduled task '${schedule.task}' at '${schedule.time}'`);
  });

  // 打印使用的模型
  logger.info(`Using model: ${config.model}`);

  // 打印触发关键词
  config.replyKeywords.forEach((keyword: any) => {
    logger.info(`Reply keyword: ${keyword}`);
  });

  // 打印加好友关键词
  config.friendKeywords.forEach((keyword: any) => {
    logger.info(`Friendship keyword: ${keyword}`);
  });
}

export function onLogout(user: Contact) {
  logger.info(`${user.name()} logged out`);
}