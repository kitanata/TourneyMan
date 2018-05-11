'use strict';

class ConfirmDialog extends DialogView {

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
    console.log("ConfirmDialog::pre_render()");
  }

  async onConfirmClicked() {
    console.log("ConfirmDialog::onConfirmClicked");

    if(this.confirm_callback !== undefined) {
      await this.confirm_callback();
    } else {
      console.log("WARNING: No confirm action callback set for dialog");
    }

    this.close();
  }

  async onCancelClicked() {
    console.log("ConfirmDialog::onCancelClicked");

    if(this.cancel_callback !== undefined) {
      await this.cancel_callback();
    }

    this.close();
  }

}
