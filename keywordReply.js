// 关键字回复配置
const keywordReplies = [
  { keyword: '媒体库', reply: '试下这个呐！https://xiaoya.miaoyimin.com' }
];

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

// 处理关键字回复
function setupKeywordReply(bot) {
  bot.on('message', async msg => {
    const text = msg.text().trim();
    const contact = msg.talker();
    const room = msg.room();
    const mentionedSelf = await msg.mentionSelf();
    const roomName = room ? await room.topic() : null;

    // 如果被@，移除@机器人名的文本
    if (mentionedSelf) {
      const mentionPattern = new RegExp(`@${bot.currentUser.name()}\\s*`, 'g');
      const cleanText = text.replace(mentionPattern, '').trim();

      // 检查是否是关键字回复
      const keywordReply = keywordReplies.find(kr => cleanText === kr.keyword);

      if (keywordReply) {
        const replyText = keywordReply.reply;
        if (room) {
          await room.say(replyText);
          logWithTimezone(`向群组${roomName}发送关键字回复:`, replyText);
        } else {
          await contact.say(replyText);
          logWithTimezone(`向用户${contact.name()}发送关键字回复:`, replyText);
        }
        return;
      }

      // 如果没有匹配到关键字，继续处理消息
      processKeywordReply(cleanText, contact, room);
    } else {
      // 未被@时，直接处理消息
      processKeywordReply(text, contact, room);
    }
  });
}

// 处理关键字回复的逻辑
async function processKeywordReply(text, contact, room) {
  // 检查是否是关键字回复
  const keywordReply = keywordReplies.find(kr => text === kr.keyword);

  if (keywordReply) {
    const replyText = keywordReply.reply;
    if (room) {
      await room.say(replyText);
      logWithTimezone(`向群组${await room.topic()}发送关键字回复:`, replyText);
    } else {
      await contact.say(replyText);
      logWithTimezone(`向用户${contact.name()}发送关键字回复:`, replyText);
    }
  }
}

export default setupKeywordReply;
