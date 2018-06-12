class Logger {

  constructor(fail_silently=false) {
    this.fail_silently = fail_silently;
    this.level = Logger.LEVELS.warning;
  }

  fatal(message) {
    if(this.level > Logger.LEVELS.fatal) return;

    console.log(message);
    if(!this.fail_silently) {
      throw new Error(message);
    }
  }

  error(message) {
    if(this.level > Logger.LEVELS.error) return;

    console.log(message);
    if(!this.fail_silently) { 
      throw new Error(message);
    }
  }

  warn(message) {
    if(this.level > Logger.LEVELS.warning) return;

    console.log(message);
  }

  debug(message) {
    if(this.level > Logger.LEVELS.debug) return;

    console.log(message);
  }

  info(message) {
    if(this.level > Logger.LEVELS.info) return;

    console.log(message);
  }
}

Logger.LEVELS = {
  'fatal': 5,
  'error': 4,
  'warning': 3,
  'debug': 2,
  'info': 1
};

const logger = new Logger(true);

export default logger;
