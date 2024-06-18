import QRCode from 'qrcode';
import { WechatyBuilder } from 'wechaty';
import PuppetWechat4u from 'wechaty-puppet-wechat4u';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import dotenv from 'dotenv';
import { setupSendMessage } from './sendMessage.js';
import setupKeywordReply from './keywordReply.js';

dotenv.config(); // 加载 .env 文件

// 配置 axios-retry
axiosRetry(axios, { retries: 3 });

// 从环境变量中读取配置
const openaiApiKey = process.env.OPENAI_API_KEY;
const maxTokens = parseInt(process.env.MAX_TOKENS) || 4096;
const model = process.env.MODEL || 'gpt-4o';
const temperature = parseFloat(process.env.TEMPERATURE) || 0.8;
const topP = parseFloat(process.env.TOP_P) || 1;
const presencePenalty = parseFloat(process.env.PRESENCE_PENALTY) || 1;
const initialPromptContent = process.env.INITIAL_PROMPT || "";
const openaiProxyUrl = process.env.OPENAI_PROXY_URL || 'https://api.openai.com';

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

// 初始化 Wechaty 实例
const bot = WechatyBuilder.build({
  name: "wechat-bot",
  puppet: new PuppetWechat4u()
});

const initialPrompt = { role: 'system', content: initialPromptContent };

// 定义上下文，包含初始提示
let context = {
  messages: [initialPrompt]
};

// 设置机器人名称
let botName = "";

// 获取ChatGPT回复
async function getChatGPTReply(text) {
  context.messages.push({ role: 'user', content: text });

  logWithTimezone(`发送请求到OpenAI:`, {
    model,
    messages: context.messages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP,
    presence_penalty: presencePenalty
  });

  try {
    const response = await axios.post(
      `${openaiProxyUrl}/v1/chat/completions`,
      {
        model,
        messages: context.messages,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        presence_penalty: presencePenalty
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`
        }
      }
    );

    const reply = response.data.choices[0].message.content.trim();
    context.messages.push({ role: 'assistant', content: reply });

    logWithTimezone(`回复内容: ${reply}`);
    return reply;
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 401)) {
      logWithTimezone(`Error with OpenAI API request: ${error.message}`);
      logWithTimezone(`请检查API密钥和网络连接`);
    } else {
      logWithTimezone(`Error with OpenAI API request: ${error.message}`);
    }
    return '捉虫了捉虫了，请检查API密钥和网络连接🐛';
  }
}

function resetContext() {
  context.messages = [initialPrompt]; // 重新设置初始提示
  logWithTimezone('上下文已重置');
}

// 处理私聊消息
async function onPrivateMessage(talker, text) {
  logWithTimezone(`发消息人: ${talker.name()} 内容: ${text}`);
  if (text.trim().toLowerCase() === '重置') {
    resetContext();
    await talker.say('上下文已重置🎉');
    return;
  }
  const chatgptReplyMessage = await getChatGPTReply(text);
  await talker.say(chatgptReplyMessage);
}

// 处理群聊消息
async function onGroupMessage(room, talker, text, msg) {
  const mentionedSelf = await msg.mentionSelf();
  const roomName = await room.topic();
  logWithTimezone(`群名: ${roomName} 发消息人: ${talker.name()} 内容: ${text} | 机器人被@：${mentionedSelf}`);

  if (mentionedSelf) {
    // 使用正则表达式移除所有提及机器人的部分
    const mentionPattern = new RegExp(`@${botName}\\s*`, 'g');
    const cleanText = text.replace(mentionPattern, '').trim();

    // 检查是否是重置指令
    if (cleanText.toLowerCase() === '重置') {
      resetContext();
      await room.say(`@${talker.name()} 上下文已重置🎉`);
      return;
    }

    const chatgptReplyMessage = await getChatGPTReply(cleanText);
    await room.say(`@${talker.name()} ${chatgptReplyMessage}`);
  }
}

// 统一消息处理函数
async function onMessage(msg) {
  const contact = msg.talker();
  const text = msg.text();
  const room = msg.room();

  // 过滤掉自己发送的消息
  if (msg.self()) {
    return;
  }

  // 根据消息类型进行处理
  if (room) {
    await onGroupMessage(room, contact, text, msg);
  } else {
    await onPrivateMessage(contact, text);
  }
}

// 启动机器人
bot.on('scan', async (qrcode, status) => {
  const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
  logWithTimezone(`💡 Scan QR Code in WeChat to login: ${status}\n${url}`);
  console.log(
    await QRCode.toString(qrcode, { type: "terminal", small: true })
  );
});

bot.on('login', async user => {
  botName = user.name();
  logWithTimezone(`用户 ${user.name()} 已登陆`);
  logWithTimezone(`机器人名称: ${botName}`);
  setupSendMessage(bot);
  setupKeywordReply(bot);
});

bot.on('message', onMessage);

bot.start().catch(console.error);

logWithTimezone(`呀咧呀咧，大小姐启动🎉`);
