'use strict';

class DeleteModelDialog extends DialogView {

  constructor(model_obj, callback) {
    super();

    this.title = "Delete";
    this.template = "delete-model-dialog";

    this.model_obj = model_obj;
    this.callback = callback;

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
    this.model_obj.destroy()
      .then( () => {
        return this.finish_progress();
      }).then( () => {
        this.close();

        if(this.callback !== undefined) {
          this.callback();
        }
      });
  }

}
