'use strict';

class SingleInputDialog extends DialogView {

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
        ".ok-button": () => this.onOkClicked()
      }
    }
  }

  pre_render() {
    console.log("SingleInputDialog::pre_render()");
  }

  onOkClicked() {
    let value = this.get_element().find('input').val();

    this.callback(value);
  }

}
