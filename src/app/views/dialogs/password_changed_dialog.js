'use strict';

import DialogView from '../../framework/dialog_view';

export default class PasswordChangedDialog extends DialogView {

  constructor(event_id) {
    super();

    this.title = "Password Changed Sucessfully!";
    this.template = "password-changed-dialog";

    this.model = {}

    this.events = {}
  }

  pre_render() {}
}
