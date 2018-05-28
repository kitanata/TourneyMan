'use strict';

import DialogView from '../../framework/dialog_view';
import logger from '../../framework/logger';

export default class DeleteModelDialog extends DialogView {

  constructor(delete_callback, done_callback) {
    super();

    this.title = "Delete";
    this.template = "delete-model-dialog";

    this.delete_callback = delete_callback; // should return a promise
    this.done_callback = done_callback;

    this.model = { 
      can_delete: false
    }

    this.events = {
      "click": {
        ".close-button": () => this.close(),
        ".confirm_delete": () => this.onModelDeleteConfirmClicked()
      }
    }
  }

  pre_render() {
    logger.info("DeleteModelDialog::pre_render()");
  }

  async onModelDeleteConfirmClicked() {
    logger.info("DeleteModelDialog::onModelDeleteConfirmClicked");

    this.start_progress();

    if(this.delete_callback === undefined) {
      this.delete_callback = Promise.resolve();
    }

    await this.delete_callback();
    await this.finish_progress();
    this.close();

    if(this.done_callback !== undefined) {
      this.done_callback();
    }
  }

}
