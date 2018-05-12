"use strict";

import BaseView from './base_view';

export default class DialogView extends BaseView {

  constructor() {
    super();

    this.dialog = null;
    this.onClose = null;

    this.progress_val = 0;
    this.phantom_val = 0;
    this.progress_id = null;
  }

  open() {
    console.log("Opening Dialog");

    this.close();

    this.dialog = new Foundation.Reveal(this.get_element(), {});
    this.dialog.open();
  }

  close() {
    if(!this.dialog) return;

    if(this.onClose) {
      this.onClose();
    }

    this.dialog.close();
    this.dialog.destroy();
    this.dialog = null;
  }

  start_progress(progress_text) {
    this.progress_val = 0;
    this.phantom_val = 0;

    this.get_element().find('.progress-text').text(progress_text);
    this.get_element().find('.progress').show();

    this.progress_id = setInterval(() => {
      this.progress_val += 1;
      this.phantom_val += 1;

      if(this.progress_val > 100)
        this.progress_val = 100;

      //reset the timer, if we hang at the end.
      if(this.phantom_val > 125) {
        this.phantom_val = 0;
        this.progress_val = 0;
      }

      this.get_element().find('.progress').val(this.progress_val);
    }, 100);
  }

  async finish_progress() {
    if(this.progress_id === null) {
      return;
    }

    clearInterval(this.progress_id);

    if(this.progress_val > 100) {
      return;
    }

    this.progress_id = setInterval(() => {
      this.progress_val += 1;

      if(this.progress_val > 100) {
        this.progress_val = 0;
        clearInterval(this.progress_id);
        return;
      }

      this.get_element().find('.progress').val(this.progress_val);

    }, 35);
  }  
}
