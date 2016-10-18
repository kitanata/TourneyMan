'use strict';

class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.title = "Event Details";
    this.template = "event-detail";

    this.event_id = event_id;

    this.model = {
      'rounds': [],
      'round_name': "",
    }

    this.events = {
      "click": {
        ".start-event": (el) => this.onStartClicked(el),
        ".event-rankings": () => {
          router.navigate("player_rankings", {}, this.event_id);
        },
        ".event-edit": () => {
          router.navigate("create_event", {}, this.event_id);
        },
        ".round-create": (el) => this.onRoundCreateClicked(el),
        ".round-start": (el) => this.onRoundStartClicked(el),
        ".round-finish": (el) => this.onRoundFinishClicked(el),
        ".round-details": (el) => this.onRoundDetailsClicked(el),
        ".round-remove": (el) => this.onRoundRemoveClicked(el),
        ".on-close": () => {
          router.navigate("back");
        }
      }
    }
  }

  pre_render() {
    console.log("EventDetail::pre_render()");

    this.event = new Event();

    console.log("Fetching event");
    this.event.fetch_by_id(this.event_id)
      .then((result) => {
        console.log("Got Event");

        this.model.event = result;
        this.model.players = [];

        return this.event.fetch_related();
      })
      .then( () => {
        this.model.players = this.event.players.to_view_models();
        this.model.rounds = this.event.rounds.to_view_models();

        console.log(this.model.rounds);
        this.rebind_events();
      })
      /*.then((result) => {
        this.model.rounds = result.docs;

        if(this.model.rounds.length != 0) {
          delete this.menu.Start;
        }

        for(let round of this.model.rounds) {
          this.menu[`Round ${round.round}`] = (el) => 
            this.onRoundClicked(el, round._id);
        }

        router.update_menu();
      })*/
      .catch((err) => console.log(err));
  }

  onRoundCreateClicked(el) {
    console.log("Round Create Clicked!");
    let new_round = new Round({
      _id: change.guid(),
      name: this.model.round_name,
      event_id: this.event.get_id(),
      started: false,
      finished: false
    });

    new_round.save()
      .then( () => {
        this.event.add_related_by_id('round', new_round.get_id());

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related();
      }).then( () => {
        this.model.round_name = "";
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundStartClicked(el) {
    console.log("Round Start Clicked");
    let round_id = $(el.currentTarget).data('id');
    console.log(round_id);
  }

  onRoundFinishClicked(el) {
    console.log("Round Finished Clicked");
    let round_id = $(el.currentTarget).data('id');
    console.log(round_id);
  }

  onRoundDetailsClicked(el) {
    console.log("Round Details Clicked");
    let round_id = $(el.currentTarget).data('id');
    console.log(round_id);
  }

  onRoundRemoveClicked(el) {
    console.log("Round Remove Clicked");
    let round_id = $(el.currentTarget).data('id');
    console.log(round_id);
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

    round_db = new PouchDB('rounds');

    round_db.put(new_round)
      .then((result) => {
        console.log("Saved new round");
        this.model.event.current_round = 1;
        this.model.event.active_round = new_round._id;

        this.event.from_view_model(this.model.event);
        return this.event.save();
      })
      .then((result) => {
        router.navigate("round_detail", new_round._id);
      })
      .catch((err) => {
        console.log(err);
      });
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
