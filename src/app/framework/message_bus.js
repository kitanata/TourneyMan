"use strict";

import logger from './logger';

export default class MessageBus {
  constructor() {
    this.messages = {};
  }

  async publish(event, options) {
    logger.info("INFO: publish");

    let subs = this.messages[event];

    if(subs === undefined)
      return;

    for(let s of subs) {
      await s.fn(options);
    }

    return;
  }

  subscribe(event, fn, context) {
    logger.info("INFO: subscribe");

    if(this.messages[event] === undefined)
      this.messages[event] = [];

    this.messages[event].push({
      "context": context,
      "fn": fn
    });
  }

  unsubscribe(context) {
    logger.info("INFO: unsubscribe");

    for(let event in this.messages) {
      let subs = this.messages[event];
      this.messages[event] = _.filter(subs, (s) => s.context != context);
    }
  }
}
