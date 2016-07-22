'use strict';

class PlayerRegistrationView extends BaseView {

  constructor() {
    super();

    this.template = "player-registration";

    this.model = {
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron
    }

    this.events = {
      "click": {
        "#create_event" : this.create_event_clicked
      }
    }
  }

  create_event_clicked(el) {
    router.navigate("create_event");
  }
}
