'use strict';

class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.title = "Round Details";
    this.template = "round-detail";

    this.model = {
      'is_superuser': false,
      'can_modify': false,
      'can_seat': false,
      'should_show_start_round': false,
      'should_show_finish_round': false,
      'should_show_create_table': false,
      'should_show_seat_players': false,
      'should_show_print_score_sheets': false,
      'should_show_generate_scores': false,
      'event': {},
      'round': {},
      'unseated': [],
    };

    this.round = new Round();
    this.round_id = round_id;

    this.table_views = [];

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        ".print-score-sheets": () => this.onPrintScoreSheetsClicked(),
        ".seat-players": () => this.onSeatPlayersClicked(),
        ".seat-player": (el) => this.onSeatPlayerClicked(el),
        ".create-table": () => this.onCreateTableClicked(),
        ".start-round": () => this.onStartRoundClicked(),
        ".finish-round": () => this.onFinishRoundClicked(),
        ".generate-random-scores": (el) => this.onRandomScoresClicked(el),
        ".on-close": () => router.navigate("back")
      }
    }
  }

  pre_render() {
    router.menu_view.set_active_menu('events');

    this.messenger.unsubscribe(this);

    this.messenger.subscribe('move_player', (options) => {
      this.onMovePlayerTriggered(options);
    }, this);

    this.messenger.subscribe('seat_player', (options) => {
      this.onSeatPlayerTriggered(options);
    }, this);

    this.messenger.subscribe('unseat_player', (options) => {
      this.onUnseatPlayerTriggered(options);
    }, this);

    this.messenger.subscribe('table_deleted', (options) => {
      this.onTableDeletedTriggered(options);
    }, this);

    this.round.fetch_by_id(this.round_id)
      .then( () => {
        this.model.round = this.round.to_view_model();

        return this.round.fetch_related();
      }).then( () => {
        this.model.event = this.round.event.to_view_model();
        this.model.is_superuser = user.is_superuser();
        this.model.can_modify = user.is_superuser();

        if(this.round.event.get('started')) {
          this.model.can_seat = this.model.can_modify;

          if(this.round.get('seated')) {
            this.model.should_show_print_score_sheets = true;
            this.model.should_show_create_table = true;

            if(user.get('developer')) {
              this.model.should_show_generate_scores = true;
            }

            if(!this.round.get('started')) {
              this.model.should_show_start_round = true;
            } else if(!this.round.get('finished')) {
              this.model.should_show_finish_round = true;
            }
          } else {
            this.model.should_show_seat_players = true;
          }
        }

        return this.round.event.fetch_related();

      }).then( (ranks) => {
        this.ranks = this.round.event.ranks.filter( (r) => !r.get('dropped'));

        if(this.round.event.get('organizer_id') === user.get_id())
          this.model.can_modify = true;

        return this.ranks.each((r) => {
          return r.fetch_related();
        });
      }).then( () => {
        return this.round.tables.fetch_related();
      }).then( () => {
        this.update_unseated();
        this.rebind_events();
        return this.build_child_views();
      });
  }

  update_unseated() {
    let tables = this.round.tables.models;
    let seated_ranks = [];
    for(let t of tables) {
      let seats = t.seats.models;
      for(let s of seats) {
        seated_ranks.push(s.get('rank_id'));
      }
    }

    this.model.unseated = [];
    for(let rank of this.ranks.models) {
      if(!_.includes(seated_ranks, rank.get_id())) {
        this.model.unseated.push({
          name: rank.player.get('name'),
          id: rank.get_id()
        });
      }
    }
  }

  build_child_views() {
    this.table_views = [];

    return this.round.tables.each( (t) => {
      let table_comp = new TableComponentView(t.get_id());

      table_comp.render(this.get_element().find('.tables'));

      this.table_views.push(table_comp);
    });
  }

  render_children() {
    this.get_element().find('.tables').empty();

    for(let tv of this.table_views) {
      tv.render(this.get_element().find('.tables'));
    }
  }

  onStartRoundClicked() {
    console.log("onStartRoundClicked");
    if(!this.model.can_modify) return; //perm guard

    this.round.set("started", true);

    this.round.save()
      .then( () => {
        this.model.round = this.round.to_view_model();
        this.model.should_show_start_round = false;
        this.model.should_show_seat_players = false;
        this.model.should_show_finish_round = true;
        this.model.can_seat = this.model.can_modify;

        if(user.get('developer')) {
          this.model.should_show_generate_scores = true;
        }

        this.render_children();
      });
  }

  onFinishRoundClicked() {
    console.log("onFinishRoundClicked");
    if(!this.model.can_modify) return; //perm guard

    this.round.finish_round()
      .then( () => {
        this.model.round = this.round.to_view_model();

        this.model.should_show_seat_players = false;
        this.model.should_show_finish_round = false;
        this.model.should_show_start_round = false;
        this.model.should_show_generate_scores = false;

        this.render_children();
      });
  }

  onMovePlayerTriggered(options) {
    console.log("onMovePlayerTriggered");

    router.open_dialog('move_player', options.seat_id);
    router.active_dialog.onClose = () => {
      this.update_unseated();
      this.render_children();
    }
  }

  onSeatPlayerTriggered(options) {
    console.log("onSeatPlayerTriggered");

    router.open_dialog('seat_player', options.rank_id, options.round);
    router.active_dialog.onClose = () => {
      this.update_unseated();
      this.render_children();
    }
  }

  onUnseatPlayerTriggered(options) {
    console.log("onUnseatPlayerTriggered");

    this.render();
    //this.update_unseated();
    //this.render_children();
  }

  onTableDeletedTriggered(options) {
    console.log("onTableDeletedTriggered");

    return this.round.update()
      .then( () => {
        return this.round.fetch_related_set('tables');
      })
      .then( () => {
        return this.round.tables.fetch_related();
      })
      .then( () => {
        return this.build_child_views();
      })
      .then( () => {
        this.update_unseated();
        this.render_children();
      });
  }
  
  onPrintScoreSheetsClicked() {
    console.log("onPrintScoreSheetsClicked");

    router.open_dialog('print_score_sheets', this.round.get_id());
  }

  onSeatPlayerClicked(el) {
    console.log("onSeatPlayerClicked");

    let rank_id = $(el.currentTarget).data('id');

    this.messenger.publish('seat_player', {
      'rank_id': rank_id,
      'round': this.round,
    });
  }

  onCreateTableClicked(el) {
    console.log("onCreateTableClicked");

    router.open_dialog("single_input_dialog", "Name your new table",
      "text", "Create Table", (table_name) => {

        let new_table = new Table();
        new_table.create();
        new_table.set('name', table_name);
        new_table.round = this.round;
        new_table.event = this.round.event;
        new_table.seats = new Seats();
        this.round.add_related_to_set('tables', new_table);

        new_table.save()
          .then( () => {
            return this.build_child_views();
          })
          .then( () => {
            this.render_children();
          });
    });
  }

  onSeatPlayersClicked() {
    console.log("onSeatPlayersClicked");
    if(!this.model.can_modify) return; //perm guard

    let num_players = this.round.event.ranks.count_where( (r) => !r.get('dropped'));

    let tables = [];

    let num_3p_tables = ((num_players % 4) * -1) + 4;
    let num_4p_tables = (num_players - (3 * num_3p_tables)) / 4;

    let num_total_tables = num_3p_tables + num_4p_tables;

    let table_promises = [];
    let seating_promise = Promise.resolve();

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

    let ranks = this.round.event.ranks.models.slice(0); //copy the array

    ranks = _.filter(ranks, (r) => !r.get('dropped'));
    ranks = new Ranks(_.shuffle(ranks));

    Promise.all(table_promises).then( () => {
      return ranks.each( (r) => {
        return r.fetch_related(); 
      });
    }).then( () => {

      // for each table not yet full
      let seats_to_save = [];

      while(true) {
        let cur_table = tables.shift()

        if(cur_table === undefined) {
          break;
        }

        // score each player for each seat
        let scores = []
        for(let player_rank of ranks.models) {
          scores = scores.concat(
            this.score_table_seat_fitness(player_rank, cur_table)
          );
        }

        // keep the highest scores.
        let best_seats = [];
        let best_score = -5000;

        for(let score of scores) {
          if(score.score > best_score) {
            best_seats = [score];
            best_score = score.score;
          }
          else if(score.score == best_score) {
            best_seats.push(score);
          }
        }

        // choose a random seat of the best seating combinations
        let seat_score = chance.pickone(best_seats);
        seat_score.seat.rank = seat_score.rank;
        ranks.remove(seat_score.rank);

        seats_to_save.push(seat_score.seat);

        // if cur_table is not full add it again
        let open_seats = cur_table.seats.filter((x) => x.rank === undefined);

        if(open_seats.models.length !== 0) {
          tables.push(cur_table);
        }
      }

      let save_p = Promise.resolve();

      for(let s of seats_to_save) {
        save_p = save_p.then( () => {
          return s.save();
        })
      }

      return save_p;
    })
    .then(() => {
      this.round.set("seated", true)

      return this.round.save()
    }).then( () => {
      this.model.round = this.round.to_view_model();
      this.model.should_show_start_round = true;
      this.model.should_show_seat_players = false;

      this.update_unseated();
      return this.build_child_views();
    }).then( () => {
      this.render_children();
    });
  }

  onRandomScoresClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    this.round.fetch_related_set('tables')
      .then(() => {
        return this.round.tables.each( (t) => {
          let winning_seat = null;
          let winning_score = -1;

          return t.fetch_related_set('seats')
            .then( () => {
              return t.seats.each( (s) => {

                let score = chance.integer({min: 0, max: 20});

                if(score > winning_score) {
                  winning_seat = s;
                  winning_score = score;
                }

                s.set("score", score);
                s.set("won", false);
                return s.save();
              });
            })
            .then( () => {
              winning_seat.set('won', true);
              winning_seat.save();
            });
        });
      })
      .then(() => {
        this.render_children();
      });
  }

  onReseatPlayersClicked(el) {
    console.log("Reseat the players");
  }

  generate_table(table_num, num_seats) {
    let new_table = new Table();
    new_table.create();
    new_table.set('name', "Table " + table_num);
    new_table.round = this.round;
    new_table.event = this.round.event;
    this.round.add_related_to_set('tables', new_table);

    let seating_promises = [];

    for(let sn = 1; sn <= num_seats; sn++) {
      let new_seat = new Seat();
      new_seat.create();
      new_seat.set('position', sn);
      new_seat.table = new_table;
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
  
  score_table_seat_fitness(player_rank, table) {

      let unoccupied_seats = table.seats.filter((x) => x.rank === undefined);

      let prev_positions = player_rank.seat_history.map((x) => {
        x.get('position');
      });
      
      prev_positions = _.takeRight(prev_positions, 3);

      let unoccupied_positions = unoccupied_seats.map((x) => x.get('position'));

      let comp_ids = player_rank.get('competitor_history_ids');
      comp_ids = _.takeRight(comp_ids, 3);

      let occupied_player_ids = table.seats.map((s) => {
        if(s.rank)
          return s.rank.player_id;

        return -1;
      });

      occupied_player_ids = _.pull(occupied_player_ids, -1);

      let comp_not_yet_encountered_ids = _.pull(occupied_player_ids, comp_ids);

      // 2 points for each competitor not encountered in last 3 rounds
      let table_score = comp_not_yet_encountered_ids.length * 2;

      let scores = [];
      for(let cur_seat of unoccupied_seats.models) {
        let seat_pos = cur_seat.get('position');
        let seat_score = _.indexOf(prev_positions, seat_pos);

        // if not a previous seat will be 3
        // if the last seat will be -9
        // if the second to last will be -6
        // if the third to last will be -3
        seat_score = seat_score * -3;

        scores.push({
          seat: cur_seat,
          rank: player_rank,
          table: table,
          score: seat_score + table_score
        });
      }

      return scores;
  }
}
