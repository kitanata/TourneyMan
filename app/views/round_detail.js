'use strict';

class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.title = "Round Details";
    this.template = "round-detail";

    this.model = {
      'event': {},
      'round': {}
    };

    this.round = new Round();
    this.round_id = round_id;

    this.events = {
      "click": {
        ".seat-players": () => this.onSeatPlayersClicked(),
        ".start-round": () => this.onStartRoundClicked(),
        ".finish-round": () => this.onFinishRoundClicked(),
        /*".record_scores": (el) => this.onRecordScoresClicked(el),
        ".drop_player": (el) => this.onDropPlayerClicked(el),*/
        ".generate-random-scores": (el) => this.onRandomScoresClicked(el),
        ".on-close": () => router.navigate("back")
      }
    }
  }

  pre_render() {
    this.round.fetch_by_id(this.round_id)
      .then( () => {
        this.model.round = this.round.to_view_model();

        return this.round.fetch_related();
      }).then( () => {
        this.model.event = this.round.event.to_view_model();

        this.rebind_events();
      });
  }

  onStartRoundClicked() {
    console.log("onStartRoundClicked");
    this.round.set("started", true);

    this.round.save()
      .then( () => {
        this.model.round = this.round.to_view_model();
      });
  }

  onFinishRoundClicked() {
    console.log("onFinishRoundClicked");
    this.round.set("finished", true)

    this.round.save()
      .then( () => {
        this.model.round = this.round.to_view_model();
      });
  }

  onSeatPlayersClicked() {
    console.log("onSeatPlayersClicked");

    let num_players = this.round.event.ranks.count();

    let tables = [];

    let num_3p_tables = ((num_players % 4) * -1) + 4;
    let num_4p_tables = (num_players - (3 * num_3p_tables)) / 4;

    let num_total_tables = num_3p_tables + num_4p_tables;

    let table_num = 1;
    for(let i=0; i < num_3p_tables; i++) {
      this.generate_table(table_num, 3).then( (table) => {
        tables.push(table);
      });

      table_num++;
    }

    for(let i=0; i < num_4p_tables; i++) {
      this.generate_table(table_num, 4).then( (table) => {
        tables.push(table);
      });

      table_num++;
    }

    //TODO: Seat players at the tables.

    this.round.set("seated", true)

    this.round.save()
      .then( () => {
        this.model.round = this.round.to_view_model();
      });
  }

  onRecordScoresClicked(el) {
    this.db.put(this.model);
    this.render();
  }

  onDropPlayerClicked(el) {
    let table_id = $(el.currentTarget).data('id');
    let seat_idx = $(el.currentTarget).data('idx');

    let table = _.find(this.model.tables, function(item) { return item.id == table_id; });

    table.players[seat_idx].dropped = !table.players[seat_idx].dropped;
    this.db.put(this.model);
    this.render();
  }

  onRandomScoresClicked(el) {
    _.each(this.model.tables, (t) => {
      for(var i=0; i < t.positions; i++) {
        t.scores[i] = chance.integer({min: 0, max: 20});
      }
    });

    this.db.put(this.model);
    this.render();
  }

  onNextRoundClicked(el) {
    console.log("Start the next round");
  }

  onReseatPlayersClicked(el) {
    console.log("Reseat the players");
  }

  //Formerly handled at the event level.
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

  generate_table(table_num, num_seats) {
    let new_table = new Table();
    new_table.create();
    new_table.set('table_number', table_num);
    tables.push(new_table);

    return new Promise( (resolve, reject) => {
      return new_table.save();
    }).then( () => {
      let seat_gen_promise = Promise.resolve();

      for(let sn = 0; sn < num_seats; sn++) {
        let new_seat = new Seat();
        new_seat.create();
        new_seat.set('position', sn);
        new_seat.set_related_model('table', new_table);
        seat_gen_promise = seat_gen_promise.then( () => new_seat.save() );
      }

      return seat_gen_promise;
    }).then( () => {
      resolve(new_table);
    });
  }
}
