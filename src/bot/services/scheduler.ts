import schedule from 'node-schedule';
import { getConfig, BotConfig } from '../config';
import { sendDailyMessage, sendNoonMessage } from './tasks';
import logger from '../../utils/logger';

const config: BotConfig = getConfig();

interface TaskMap {
  [key: string]: () => void;
}

const taskMap: TaskMap = {
  sendDailyMessage,
  sendNoonMessage
};

export function startScheduler() {
  config.schedules.forEach((scheduleConfig: any) => {
    const { time, task } = scheduleConfig;
    const taskFunction = taskMap[task];
    if (taskFunction) {
      schedule.scheduleJob(time, taskFunction);
      logger.info(`Scheduled task '${task}' at '${time}'`);
    } else {
      logger.error(`Task '${task}' is not defined.`);
    }
  });
}