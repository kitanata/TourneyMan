'use strict';

import DialogView from '../../framework/dialog_view';
import logger from '../../framework/logger';

export default class ProgressDialog extends DialogView {

  constructor(progress_text, promise, callback) {
    super();

    this.title = "Just one moment...";
    this.template = "progress-dialog";

    this.model = { 
      is_finished: false
    }

    this.progress_text = progress_text;
    this.promise = promise;
    this.callback = callback;

    this.events = {
      "click": {
        ".close-button": () => this.close(),
      }
    }
  }

  async pre_render() {
    logger.info("ProgressDialog::pre_render()");

    this.start_progress(this.progress_text);

    await this.promise();
    await this.finish_progress();
    
    this.model.is_finished = true;
    this.get_element().find('.progress-text').text("Finished");

    if(this.callback !== undefined) {
      await this.callback();
    }
  }
}
