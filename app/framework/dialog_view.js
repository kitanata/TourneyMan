"use strict";

class DialogView extends BaseView {

  constructor() {
    super();

    this.dialog = null;
    this.onClose = null;
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
}
