import schedule from 'node-schedule';

// 全局日志时区配置
function logWithTimezone(message, data = null) {
  const timeZone = 'Asia/Shanghai';
  const time = new Date().toLocaleString('zh-CN', { timeZone });
  if (data) {
    console.log(`${time} - ${message}`, data);
  } else {
    console.log(`${time} - ${message}`);
  }
}

// 定时任务配置
export function setupSendMessage(bot) {
  // 每月25日12点向群组GPTPlus合租发送消息
  schedule.scheduleJob('0 12 25 * *', async () => {
    const room = await bot.Room.find({ topic: 'GPTPlus合租' });
    if (room) {
      const message = `⚠️⚠️⚠️
-----
⏰您的ChatGPT Plus订阅服务即将进入冬眠💤
🙏扣1表示进行续订🫶
-----
⚠️⚠️⚠️`;
      await room.say(message);
      logWithTimezone('向群组GPTPlus合租发送定时消息:', message);
    } else {
      logWithTimezone('未找到群组GPTPlus合租');
    }
  });

  // 每日24:00向用户王明明发送消息
  schedule.scheduleJob('0 0 0 * * *', async () => {
    const contact = await bot.Contact.find({ name: '王明明' });
    if (contact) {
      const message = '恭喜你又活下来了一天！';
      await contact.say(message);
      logWithTimezone('向用户王明明发送每日消息:', message);
    } else {
      logWithTimezone('未找到用户王明明');
    }
  });
}
