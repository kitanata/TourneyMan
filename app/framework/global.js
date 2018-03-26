
let global_instance = null;

export default class Global {

  constructor() {
    this.user = null;
  }

  static instance() {
    return global_instance;
  }
}

global_instance = new Global();
