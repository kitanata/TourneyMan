'use strict';

class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.title = "Event Details";
    this.template = "event-detail";

    this.event = null;
    this.event_id = event_id;

    this.model = {
      'organizer': {},
      'event': {},
      'players': [],
      'rounds': [],
      'ranks': [],
      'round_name': "",
    }

    this.events = {
      "click": {
        ".start-event": (el) => this.onStartEventClicked(el),
        ".cancel-event": (el) => this.onCancelEventClicked(el),
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
        ".on-close": () => router.navigate("back")
      }
    }
  }

  pre_render() {
    console.log("EventDetail::pre_render()");

    this.event = new Event();

    console.log("Fetching event");
    this.event.fetch_by_id(this.event_id)
      .then( () => {
        this.model.event = this.event.to_view_model();
        this.model.players = [];
        this.model.rounds = [];
        this.model.ranks = [];

        return this.event.fetch_related();
      })
      .then( () => {
        this.model.players = this.event.players.to_view_models();
        this.model.rounds = this.event.rounds.to_view_models();
        this.model.ranks = this.event.ranks.to_view_models();
        this.model.organizer = this.event.organizer.to_view_model();

        this.rebind_events();
      })
      .catch((err) => console.log(err));
  }

  onRoundCreateClicked(el) {
    let new_round = new Round();

    new_round.create();
    new_round.set('name', this.model.round_name);
    new_round.set_related_model('event', this.event);

    new_round.save()
      .then( () => {
        this.event.add_related_by_id('round', new_round.get_id());

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.round_name = "";
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundRemoveClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        return round.remove();
      })
      .then( () => {
        this.event.remove_related_by_id('round', round_id);

        return this.event.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }


  onRoundStartClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        round.set('started', true);

        return round.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundFinishClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    let round = new Round();
    round.fetch_by_id(round_id)
      .then( () => {
        if(round.get('started'))
          round.set('finished', true)

        return round.save();
      }).then( () => {
        return this.event.fetch_related_set('rounds', Rounds);
      }).then( () => {
        this.model.rounds = this.event.rounds.to_view_models();

        this.rebind_events();
      });
  }

  onRoundDetailsClicked(el) {
    let round_id = $(el.currentTarget).data('id');

    router.navigate("round_detail", {}, round_id);
  }

  onStartEventClicked(el) {
    this.event.set('started', true);

    this.event.save()
      .then( () => {
        //after locking the event. Make sure we have all the players.
        this.event.fetch_related_set('players', Users);
      })
      .then( () => {
        let rank_promise = Promise.resolve(true);

        //Generate Ranks Here
        for(let player of this.event.players.models) {
          let new_rank = new Rank();

          new_rank.create();
          new_rank.set_related_model('event', this.event);
          new_rank.set_related_model('player', player);

          rank_promise = rank_promise.then(() => new_rank.save());
        }

        return rank_promise;
      })
      .then( () => {
        return this.event.fetch_related_set('ranks', Ranks);
      }).then( () => {
        this.model.event = this.event.to_view_model();
        this.model.ranks = this.event.ranks.to_view_models();

        this.update();
        this.rebind_events();
      });
  }

  onCancelEventClicked(el) {
    this.event.drop_related_set('ranks', Ranks)
      .then( () => {
        this.event.set('started', false);

        return this.event.save();
      }).then( () => {
        this.model.event = this.event.to_view_model();
        this.model.ranks = [];

        this.update();
        this.rebind_events();
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
