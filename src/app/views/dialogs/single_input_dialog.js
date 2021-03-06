'use strict';

import DialogView from '../../framework/dialog_view';
import logger from '../../framework/logger';

export default class SingleInputDialog extends DialogView {

  constructor(label, input_type, button_label, callback) {
    super();

    this.title = "Hey, there. I have a question...";
    this.template = "single-input-dialog";

    this.model = { 
      label: label,
      input_type: input_type,
      button_label: button_label,
      value: ""
    }

    this.callback = callback;

    this.events = {
      "click": {
        ".close-button": () => this.close(),
        ".ok-button": () => this.onOkClicked()
      }
    }
  }

  pre_render() {
    logger.info("SingleInputDialog::pre_render()");
  }

  onOkClicked() {
    let value = this.get_element().find('input').val();

    this.callback(value);
    this.close();
  }

}
