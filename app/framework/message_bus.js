class MessageBus {
  constructor() {
    this.messages = {};
  }

  publish(event, options) {
    console.log("INFO: publish");

    let subs = this.messages[event];

    if(subs === undefined)
      return Promise.resolve();

    let p = Promise.resolve();

    for(let s of subs) {
      p.then( () => {
        return s.fn(options);
      });
    }

    return p;
  }

  subscribe(event, fn, context) {
    console.log("INFO: subscribe");

    if(this.messages[event] === undefined)
      this.messages[event] = [];

    this.messages[event].push({
      "context": context,
      "fn": fn
    });
  }

  unsubscribe(context) {
    console.log("INFO: unsubscribe");

    for(let event in this.messages) {
      let subs = this.messages[event];
      this.messages[event] = _.filter(subs, (s) => s.context != context);
    }
  }
}
