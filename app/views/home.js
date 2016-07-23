'use strict';

class HomeView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "home";

    this.model = {
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron
    }

    this.menu = {
      "create_event": "Setup an Event"
    }
  }
}
