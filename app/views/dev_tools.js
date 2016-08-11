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
    this.players_db.destroy().then( (response) => {
      return this.events_db.destroy()
    }).then( (response) => {
      console.log("Database Destroyed");
    }).catch( (err) => {
      console.log("Could not destroy database.");
    });
  }

  onGenPlayersClicked(el) {
    console.log("Generate Players");

    let num_players = parseInt($("#num_players").val());

    this.events_db.allDocs({include_docs: true}).then(
      (result) => {
        let event_ids = _.map(result.rows, (x) => x.doc._id);

        let players = [];

        for(let i=0; i < num_players; i++) {
          players.push({
            event_id: chance.pickone(event_ids),
            name: chance.name(),
            email: chance.email(),
            phone_number: chance.phone(),
            address: chance.address(),
            city: chance.city(),
            state: chance.state({ full: true }),
            zip_code:  chance.zip(),
          });
        }

        this.players_db.bulkDocs(players
        ).then(function (result) {
          console.log("Done Generating Players.");
        }).catch(function (err) {
          console.log(err);
        });
      }
    )
  }

  onGenEventsClicked(el) {
    let num_events = parseInt($("#num_events").val());

    let event_part_1 = ["MTG", "Catan", "Legendary", "Acension", "Dominion"]
    let event_part_2 = ["National", "Masters", "Regional"]
    let event_part_3 = ["Qualifier", "Finals", "Semi-Finals"]

    let locations = ["Spiel", "Gencon", "Dragoncon", "PAX East", "BGG.con", "BGF"]

    let events = [];
    for(let i=0; i < num_events; i++) {
      let game_name = chance.pickone(event_part_1);

      let event_name = `${game_name} ${chance.pickone(event_part_2)} ${chance.pickone(event_part_3)}`;

      events.push({
        event_name: event_name,
        game_name: game_name,
        organizer_name: chance.name(),
        location: chance.pickone(locations),
        date: chance.date({string: true}),
        num_rounds: "3",
        local_admin_password: "abcd1234",
        local_admin_confirm: "acbd1234",
        local_admin_salt: "elephant",
      });
    }

    this.events_db.bulkDocs(events
    ).then(function (result) {
      console.log("Done Generating Events.");
    }).catch(function (err) {
      console.log(err);
    });
  }
}
