import logger, { COLOR_LOG } from '@libs/logger';
import { delayUtil } from '@utils/common.util';
import axios from 'axios';

const MAX_RETRY = 10;
const DELAY_TIME = 500;

export class TelegramClient {
  private name: string;
  private botToken: string;
  private receiver: string;
  private maxRetry: number;
  private delay: number;
  private listTeleMessage: TTelegramMessage[];
  private isRunning: boolean;

  constructor(options: TTelegramOption) {
    this.name = options.name || '';
    this.botToken = options.token;
    this.receiver = options.receiver;
    this.maxRetry = options.maxRetry || MAX_RETRY;
    this.delay = options.delay || DELAY_TIME;
    this.listTeleMessage = [];
    this.isRunning = false;
  }

  sendMessage(message: string, isRetry: boolean = true) {
    this.listTeleMessage.push({
      message,
      isRetry,
      numberOfRetry: 0,
    });

    this.sendMessageLoop();
  }

  private async sendMessageLoop(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;

    while (this.listTeleMessage.length > 0) {
      const telegramMessage = this.listTeleMessage.shift();
      try {
        await axios({
          method: 'get',
          url: `https://api.telegram.org/bot${this.botToken}/sendmessage`,
          params: {
            chat_id: this.receiver,
            text: `${this.name ? `[${this.name}]` : ''} ${telegramMessage.message}`,
          },
        });
      } catch (error) {
        logger.logDebug(
          'TelegramClient -> sendMessageLoop -> Error send message. error=%s, name=%s, message=%s',
          error.message,
          this.name,
          telegramMessage.message,
        );
        if (telegramMessage.numberOfRetry < this.maxRetry) {
          telegramMessage.numberOfRetry += 1;
          this.listTeleMessage.unshift(telegramMessage);
          await delayUtil(this.delay);
          return;
        }
        logger.logInfoColor(
          COLOR_LOG.YELLOW,
          `TelegramClient -> sendMessageLoop -> Max retry for message=${JSON.stringify(telegramMessage)}`,
        );
      }
    }

    this.isRunning = false;
  }
}

type TTelegramMessage = {
  message: string;
  isRetry: boolean;
  numberOfRetry: number;
};

type TTelegramOption = {
  token: string;
  receiver: string;
  name?: string;
  maxRetry?: number;
  delay?: number;
};
