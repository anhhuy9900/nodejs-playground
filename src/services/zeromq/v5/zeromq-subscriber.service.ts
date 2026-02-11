import { inject, injectable } from 'tsyringe';

const zmqPub = require('zeromq');

export interface ZmqSubscriberInterface {
  consume: (onMessage: ZmqMessageHandler) => void;
}

export type ZmqMessageHandler = (topic: string, message: any) => void;

@injectable()
export class ZmqSubscriber implements ZmqSubscriberInterface {
  private sock: any;

  constructor(
    @inject('ZEROMQ_SUB_URL') ZEROMQ_SUB_URL: string,
    @inject('ZEROMQ_TOPIC') private readonly TOPIC: string,
  ) {
    const sock = zmqPub.socket('sub');
    sock.connect(ZEROMQ_SUB_URL);
    this.sock = sock;
    this.TOPIC = TOPIC;
  }

  consume(onMessage: ZmqMessageHandler) {
    this.sock.subscribe(this.TOPIC);

    this.sock.on('message', function (topic: string, message: any) {
      onMessage(topic, message);
    });
  }
}
