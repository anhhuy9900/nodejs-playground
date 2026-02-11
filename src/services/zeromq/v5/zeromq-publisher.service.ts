import logger from '@libs/logger';
import { inject, injectable } from 'tsyringe';

const zmqPub = require('zeromq');

export interface ZmqPublisherInterface {
  sendMessage: (message: Record<string, any>) => void;
}

@injectable()
export class ZmqPublisher implements ZmqPublisherInterface {
  private sock: any;

  constructor(
    @inject('ZEROMQ_PUB_URL') ZEROMQ_PUB_URL: string,
    @inject('ZEROMQ_TOPIC') private readonly TOPIC: string,
  ) {
    const sock = zmqPub.socket('pub');
    sock.connect(ZEROMQ_PUB_URL);
    this.sock = sock;
    this.TOPIC = TOPIC;
  }

  sendMessage(message: any) {
    logger.logInfo('ZmqPublisher - sendMessage to: %s, containing message: %j', this.TOPIC, message);
    this.sock.send([this.TOPIC, JSON.stringify(message)]);
  }
}
