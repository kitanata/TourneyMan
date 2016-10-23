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

        this.round.event.fetch_related();

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

    let table_promises = [];
    let seating_promises = [];

    let table_num = 1;

    //generate 3 player tables
    for(let i=0; i < num_3p_tables + num_4p_tables; i++) {
      let num_seats = 4;

      if(i < num_3p_tables)
        num_seats = 3;

      let p = this.generate_table(table_num, num_seats).then( (table) => {
        tables.push(table);

        return Promise.resolve();
      });

      table_num++;

      table_promises.push(p);
    }

    Promise.all(table_promises).then( () => {

      let ranks = this.round.event.ranks.models.slice(0); //copy the array

      ranks = _.shuffle(ranks);

      //for each player not yet seated
      for(let player_rank of ranks) {

        let best_tables = [];
        let best_score = -1;

        let score_promises = [];

        // for each table not yet full
        for(let t of tables) {
          // score the fitness of that player for that table
          //  fitness is:
          //    5 points if the table has a seat in a position they haven't had before
          //    1 point for each player they haven't played against in other seats
          //    0 points if the table is full

          let fitness_score = this.score_table_fitness(player_rank, t)
            .then( (fit_score) => {
              if(fit_score > best_score)
                best_tables = [t];
              else if(fit_score == best_score)
                best_tables.push(t);

              return Promise.resolve();
            });

          score_promises.push(fitness_score);
        }

        let seat_promise = Promise.all(score_promises)
          .then( () => {
            // seat the player at the table with the highest score
            let table = chance.pickone(best_tables);

            // if multiple are tied. choose one at random.
            return this.seat_player(player_rank, table);
          });

        seating_promises.push(seat_promise);
      }

      Promise.all(seating_promises) 
        .then(() => {
          this.round.set("seated", true)

          return this.round.save()
        }).then( () => {
          this.model.round = this.round.to_view_model();
        });
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

  generate_table(table_num, num_seats) {
    let new_table = new Table();
    new_table.create();
    new_table.set('table_number', table_num);
    new_table.set_related_model('round', this.round);
    new_table.set_related_model('event', this.round.event);

    let seating_promises = [];

    for(let sn = 0; sn < num_seats; sn++) {
      let new_seat = new Seat();
      new_seat.create();
      new_seat.set('position', sn);
      new_seat.set_related_model('table', new_table);
      new_table.add_related_to_set('seats', new_seat);

      seating_promises.push(new_seat.save());
    }

    return Promise.all(seating_promises)
      .then( () => {
        return new_table.save();
      }).then( () => {
        return new_table;
      });
  }

  score_table_fitness(player_rank, table) {
    //  fitness is:
    //    3 points for every seat in a position they haven't had before
    //    1 point for each player they haven't played against in other seats
    //    0 points if the table is full

    return new Promise( (resolve, reject) => {
      let score = 0;

      let full_table = _.every(table.seats.models, (x) => {
        return x.is_occupied();
      });

      if(full_table)
        resolve(score);

      let unoccupied_seats = _.filter(table.seats.models, (x) => !x.is_occupied());

      player_rank.fetch_related_set('seat_history', Seats)
        .then( () => {
          let prev_positions = _.map(player_rank.seat_history.models, (x) => {
            x.get('position');
          }).takeRight(3);

          let unoccupied_positions = _.map(unoccupied_seats, (x) => x.get('position'));

          let qualified_positions = _.pull(unoccupied_positions, prev_positions);

          // 3 points for every seat where this player hasn't sat before
          score += qualified_positions.length * 3; 

          let comp_ids = player_rank.get('competitor_history_ids');

          let occupied_player_ids = _.map(table.seats, (s) => {
            return s.rank.player_id;
          });

          let comp_not_yet_encountered_ids = _.pull(occupied_player_ids, comp_ids);

          score += comp_not_yet_encountered_ids.length * 1;

          resolve(score);
        });
    });
  }

  seat_player(player_rank, table) {
    let unoccupied_seats = _.filter(table.seats, (x) => !x.is_occupied());

    let prev_positions = _.map(player_rank.seat_history, (x) => x.get('position'));

    prev_positions = prev_position.takeRight(3);

    let sat_player_at = null;

    for(let s of unoccupied_seats) {
      if(!_.includes(prev_positions, s.position)) {
        s.set_related_model('rank', player_rank);
        sat_player_at = s;
      }
    }

    // We have no choice but to duplicate a position
    if(!sat_player_at) {
      sat_player_at = chance.pickone(unoccupied_seats);

      sat_player_at.set_related_model('rank', player_rank);
    }

    return sat_player_at.save();
  }
}
