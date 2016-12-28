'use strict';

class MovePlayerDialog extends DialogView {

  constructor() {
    super();

    this.title = "Move Player";
    this.template = "move-player-dialog";

    this.model = { 
    }

    this.events = {
      "click": {
        ".event_register": () => this.onEventRegisterClicked()
      }
    }
  }

  pre_render() {
    console.log("MovePlayerDialog::pre_render()");
  }

  onEventRegisterClicked() {
    console.log("MovePlayerDialog::onEventRegisterClicked");
  }
}
