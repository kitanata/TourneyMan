'use strict';

class PasswordChangedDialog extends DialogView {

  constructor(event_id) {
    super();

    this.title = "Password Changed Sucessfully!";
    this.template = "password-changed-dialog";

    this.model = {}

    this.events = {}
  }

  pre_render() {}
}
