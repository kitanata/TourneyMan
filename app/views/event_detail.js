'use strict';

class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.db = new PouchDB('events');
    this.player_db = new PouchDB('players');
    this.round_db = new PouchDB('rounds');

    this.title = "Event Details";
    this.template = "event-detail";

    this.event_id = event_id;

    this.menu = {
      "Start": (el) => this.onStartClicked(el),
      "Rankings": (el) => this.onRankingsClicked(el),
      "Edit Event": (el) => this.onEventEditClicked(el),
    }
  }

  pre_render() {
    this.db.get(this.event_id)
      .then((result) => {
        this.model.event = result;

        return this.round_db.find({
          selector: {
            event_id: this.event_id
          }
        });
      })
      .then((result) => {
        this.model.rounds = result.docs;

        if(this.model.rounds.length != 0) {
          delete this.menu.Start;
        }

        for(let round of this.model.rounds) {
          this.menu[`Round ${round.round}`] = (el) => 
            this.onRoundClicked(el, round._id);
        }

        router.update_menu();
      })
      .catch(
        (err) => console.log(err)
      );

    this.player_db.find({
      selector: { 
        event_id: this.event_id 
      }
    })
    .then((result) => {
      this.model.players = result.docs;
    })
    .catch((err) => {
      console.log(err);
    });
  }

  onStartClicked(el) {
    console.log("Starting Tournament");

    let num_players = this.model.players.length;

    let tables = this.generate_tables(num_players);

    for(let player of this.model.players) {
      let found_seat = false;

      for(let table of tables) {
        if(table.seat_player(player)) {
          found_seat = true;
          break;
        }
      }

      if(!found_seat)
        //The way the math works out, we should never hit this line.
        console.log("COULD NOT FIND SEAT! ERROR! ERROR!");
    }

    let new_round = {
      _id: chance.guid(),
      event_id: this.event_id,
      round: 1,
      tables: tables,
      started: true,
      finished: false
    };

    this.round_db.put(new_round)
      .then((result) => {
        console.log("Saved new round");
        this.model.event.current_round = 1;
        this.model.event.active_round = new_round._id;

        return this.db.put(this.model.event);
      })
      .then((result) => {
        router.navigate("round_detail", new_round._id);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  onRoundClicked(el, round) {
    router.navigate("round_detail", round);
  }

  onRankingsClicked(el) {
    router.navigate("player_rankings", this.event_id);
  }

  onEventEditClicked(el) {
    router.navigate("create_event", this.event_id);
  }

  generate_tables(num_players) {
    let tables = [];

    let table_num = 1;

    let num_3p_tables = ((num_players % 4) * -1) + 4;
    for(let i=0; i < num_3p_tables; i++) {
      tables.push(new Table(3, table_num));
      table_num++;
    }

    let num_4p_tables = (num_players - (3 * num_3p_tables)) / 4;
    for(let i=0; i < num_4p_tables; i++) {
      tables.push(new Table(4, table_num));
      table_num++;
    }

    return tables;
  }

}
