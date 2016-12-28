"use strict";

class DialogView extends BaseView {

  constructor() {
    super();

    this.dialog = null;
  }

  open() {
    console.log("Opening Dialog");

    this.close();

    this.dialog = new Foundation.Reveal(this.get_element(), {});
    this.dialog.open();
  }

  close() {
    if(!this.dialog) return;

    this.dialog.close();
    this.dialog.destroy();
    this.dialog = null;
  }
}
