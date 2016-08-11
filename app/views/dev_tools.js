'use strict';

class DevToolsView extends BaseView {

  constructor() {
    super();

    this.title = "Dev Tools";
    this.template = "dev-tools";

    this.players_db = new PouchDB('players');
    this.events_db = new PouchDB('events');

    this.model = {
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron
    }

    this.menu = {
    }

    this.events = {
      "click": {
        ".clear_database": (el) => this.onClearDatabaseClicked(el),
        ".generate_players": (el) => this.onGenPlayersClicked(el),
        ".generate_events": (el) => this.onGenEventsClicked(el)
      }
    }
  }

  onClearDatabaseClicked(el) {
    console.log("Clear Database");
  }

  onGenPlayersClicked(el) {
    console.log("Generate Players");
  }

  onGenEventsClicked(el) {
    console.log("Generate Events");
  }
}
