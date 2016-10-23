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
      num_users: 0,
      num_events: 0,
      num_players: 0,
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
    Events().drop_all()
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
    console.log("Generating Users");
    for(let i=0; i < this.model.num_users; i++) {
      let new_user = new User();
      new_user.randomize(); //saves them by using register function.
    }

    console.log("Generating Events");
    for(let i=0; i < this.model.num_events; i++) {
      let new_event = new Event();
      new_event.randomize();
      new_event.save();
    }

    let events = new Events();
    let users = new Users();

    //RUN PROMISES SEQUENTIALLY
    let player_promise = new Promise( (resolve, reject) => {
      setTimeout(() => resolve(), 1000);
    });

    console.log("Generating Players");
    for(let i=0; i < this.model.num_players; i++) {
      player_promise = player_promise.then(() => {
        return this.generate_player(users, events);
      });
    }

    player_promise.then( () => {
      console.log("Finished Creating Players!");
    });
  }

  generate_player(users, events) {
    return new Promise( (resolve, reject) => {
      var user = users.get_random_model();
      var event = events.get_random_model();

      Promise.all([user, event])
        .then( values => {
          user = values[0];
          event = values[1];

          user.add_related_to_set('events', event);
          event.add_related_to_set('players', user);

          return user.save();
        })
        .then( () => {
          return event.save();
        })
        .then( () => {
          console.log("Created Player!");
          resolve();
        })
    });
  }
}
