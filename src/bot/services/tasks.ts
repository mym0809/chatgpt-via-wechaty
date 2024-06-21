import { Wechaty } from 'wechaty'
import { getConfig } from '../config.ts'
import logger from '../utils/logger.ts'

const config = getConfig()

async function sendMessage(targets: { contacts: string[], groups: string[] }, message: string) {
  const bot = Wechaty.instance()

  // 发送给联系人
  for (const contactName of targets.contacts) {
    const contact = await bot.Contact.find({ name: contactName })
    if (contact) {
      await contact.say(message)
      logger.info(`Sent message to contact: ${contactName}`)
    } else {
      logger.error(`Failed to find contact: ${contactName}`)
    }
  }

  // 发送给群组
  for (const groupName of targets.groups) {
    const room = await bot.Room.find({ topic: groupName })
    if (room) {
      await room.say(message)
      logger.info(`Sent message to group: ${groupName}`)
    } else {
      logger.error(`Failed to find group: ${groupName}`)
    }
  }
}

export async function sendDailyMessage() {
  const schedule = config.schedules.find(s => s.task === 'sendDailyMessage')
  if (schedule) {
    const targets = { contacts: schedule.contacts, groups: schedule.groups }
    await sendMessage(targets, schedule.message)
  }
}

export async function sendNoonMessage() {
  const schedule = config.schedules.find(s => s.task === 'sendNoonMessage')
  if (schedule) {
    const targets = { contacts: schedule.contacts, groups: schedule.groups }
    await sendMessage(targets, schedule.message)
  }
}