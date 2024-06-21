import { createBot, startBot, stopBot } from './src/bot/bot'
import logger from './src/utils/logger'

const bot = createBot()

process.on('SIGINT', async () => {
  await stopBot(bot)
  process.exit(0)
})

startBot(bot).catch(error => {
  logger.error(`Failed to start bot: ${error}`)
  process.exit(1)
})