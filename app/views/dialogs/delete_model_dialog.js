'use strict';

class DeleteModelDialog extends DialogView {

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
        ".confirm_delete": () => this.onModelDeleteConfirmClicked()
      }
    }
  }

  pre_render() {
    console.log("DeleteModelDialog::pre_render()");
  }

  onModelDeleteConfirmClicked() {
    console.log("DeleteModelDialog::onModelDeleteConfirmClicked");

    this.start_progress();

    if(this.delete_callback === undefined) {
      this.delete_callback = Promise.resolve();
    }

    this.delete_callback()
      .then( () => {
        return this.finish_progress();
      }).then( () => {
        this.close();

        if(this.done_callback !== undefined) {
          this.done_callback();
        }
      });
  }

}
