'use strict';

class ProgressDialog extends DialogView {

  constructor(progress_text, promise) {
    super();

    this.title = "Just one moment...";
    this.template = "progress-dialog";

    this.model = { 
      is_finished: false
    }

    this.progress_text = progress_text;

    this.promise = promise;

    this.events = {
      "click": {
      }
    }
  }

  pre_render() {
    console.log("ProgressDialog::pre_render()");

    this.start_progress(this.progress_text);

    this.promise.then( () => {
      return this.finish_progress();
    }).then( () => {
      this.model.is_finished = true;
      this.get_element().find('.progress-text').text("Finished");
    })
  }
}
