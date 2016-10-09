'use strict';

class DevToolsView extends BaseView {

  constructor() {
    super();

    this.title = "Dev Tools";
    this.template = "dev-tools";

    this.players_db = new PouchDB('players');
    this.events_db = new PouchDB('events');
    this.rounds_db = new PouchDB('rounds');

    this.model = {
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron
    }

    this.menu = {
    }

    this.events = {
      "click": {
        ".on-close": () => {
          router.navigate("back");
        },
        ".clear_database": (el) => this.onClearDatabaseClicked(el),
        ".generate_data": (el) => this.onGenDataClicked(el),
      }
    }
  }

  onClearDatabaseClicked(el) {
    let players = new Players();

    players.drop_all()
      .then( (response) => {
        return new Events().drop_all();
      })
      .then( (response) => {
        return new Users().drop_all();
      })
      .then( (response) => {
        return this.rounds_db.destroy()
      })
      .then( (response) => {
        console.log("Database Destroyed");
      })
      .catch( (err) => {
        console.log("Could not destroy database.");
      });
  }

  onGenDataClicked(el) {
    let num_users = parseInt($("#num_users").val());
    let num_events = parseInt($("#num_events").val());
    let num_players = parseInt($("#num_players").val());

    console.log("Generating Users");
    for(let i=0; i < num_users; i++) {
      let new_user = new User();
      new_user.randomize(); //saves them by using register function.
    }

    console.log("Generating Events");
    for(let i=0; i < num_events; i++) {
      let new_event = new Event();
      new_event.randomize();
      new_event.save();
    }

    console.log("Generating Players");
    for(let i=0; i < num_players; i++) {
      let new_player = new Player();

      new_player.randomize()
        .then( () => {
          new_player.save();
        });
    }
  }
}
