'use strict';

import DialogView from '../../framework/dialog_view';

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
    console.log("DeleteModelDialog::pre_render()");
  }

  async onModelDeleteConfirmClicked() {
    console.log("DeleteModelDialog::onModelDeleteConfirmClicked");

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
