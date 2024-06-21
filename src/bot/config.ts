// src/bot/config.ts

import fs from 'fs';
import path from 'path';

export interface BotConfig {
  botName: string;
  puppet: string;
  openaiApiKey: string;
  openaiApiUrl: string;
  geminiApiKey: string;
  geminiApiUrl: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  friendKeywords: string[];
  friendKeywordsRelation: string;
  schedules: Array<{
    time: string;
    task: string;
    contacts: string[];
    groups: string[];
    message: string;
  }>;
  replyKeywords: string[];
  model: string;
  logTimezone: string;
}

export function getConfig(): BotConfig {
  const configPath = path.join(__dirname, '../../config.json');
  const configFile = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configFile);
}