'use strict';

import DialogView from '../../framework/dialog_view';
import logger from '../../framework/logger';

export default class ConfirmDialog extends DialogView {

  constructor(message, onConfirm, onCancel) {
    super();

    this.title = "Confirm Action";
    this.template = "confirm-dialog";

    this.confirm_callback = onConfirm;
    this.cancel_callback = onCancel;

    this.model = { 
      message: message
    }

    this.events = {
      "click": {
        ".confirm_action": () => this.onConfirmClicked(),
        ".cancel_action": () => this.onCancelClicked()
      }
    }
  }

  pre_render() {
    logger.info("ConfirmDialog::pre_render()");
  }

  async onConfirmClicked() {
    logger.info("ConfirmDialog::onConfirmClicked");

    if(this.confirm_callback !== undefined) {
      await this.confirm_callback();
    } else {
      logger.warn("WARNING: No confirm action callback set for dialog");
    }

    this.close();
  }

  async onCancelClicked() {
    logger.info("ConfirmDialog::onCancelClicked");

    if(this.cancel_callback !== undefined) {
      await this.cancel_callback();
    }

    this.close();
  }

}
