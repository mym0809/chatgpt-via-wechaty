import { Friendship } from 'wechaty';
import { getConfig, BotConfig } from '../config';
import logger from '../../utils/logger';

const config: BotConfig = getConfig();

export async function onFriendship(friendship: Friendship) {
  try {
    if (friendship.type() === Friendship.Type.Receive) {
      const keywords = config.friendKeywords;
      const relation = config.friendKeywordsRelation;
      const hello = friendship.hello();

      let shouldAccept = false;
      if (relation === 'and') {
        shouldAccept = keywords.every(keyword => hello.includes(keyword));
      } else {
        // Default to 'or' relation
        shouldAccept = keywords.some(keyword => hello.includes(keyword));
      }

      if (shouldAccept) {
        await friendship.accept();
        logger.info(`Automatically accepted friend request from ${friendship.contact().name()} with message: ${hello}`);
      } else {
        logger.info(`Received friend request from ${friendship.contact().name()} with message: ${hello}, but it does not meet the keyword criteria.`);
      }
    } else if (friendship.type() === Friendship.Type.Confirm) {
      logger.info(`Friendship confirmed with ${friendship.contact().name()}`);
    }
  } catch (error) {
    logger.error('Error handling friendship request:', error);
  }
}