import chance from 'chance';
import _ from 'lodash';

import logger from '../../../framework/logger';

import Seat from './seat';
import Table from './table';


export default class Round {

  constructor(players=[], tables=[]) {
    this._tables = tables
    this.players = players

    this.memo_score = None
  }

  to_str() {
    value = ""

    for(let num in this._tables) {
      const table = this._tables[num];
      value += `TABLE #${num}\n${table.to_str()}\n`;
    }

    return value
  }

  to_repr() {
    return this.to_str();
  }

  count() {
    return this._tables.length;
  }

  num_seats() {
    return _.sum(_.map((t) => t.count(), this._tables));
  }

  clone() {
    const tables = _.map((t) => t.clone(), this._tables);
    return new Round(this.players, tables)
  }

  validate() {
    player_names = _map((p) => p.name, this.players);
    names = this.get_player_names()

    if(_.uniq(names).length !== player_names.length) {
      logger.error("Round Validation Failed");
    }
  }

  count_tables_of_size(num_seats) {
    return _.filter((t) => t.count() === num_seats, this._tables).length;
  }

  should_converge(round_num, config) {
    // No matter what, if this is the first round we should converge on the first
    // attempt at pairing. If we don't something is seriously wrong with the algorithm.
    if(round_num === 1){
      return true;
    }

    if(config.NUM_PLAYERS <= config.SEATS_PER_TABLE) {
      return true;
    }

    // The number of tables > maximum number of seats per table for us to 
    // have a chance to converge.
    if(this.count() < config.SEATS_PER_TABLE) {
      return false;
    }

    // If there are less tables of maximum size than the number of rounds
    // we will not converge
    if(this.count_tables_of_size(config.SEATS_PER_TABLE) <= round_num) {
      return false;
    }

    // Otherwise, convergence is possible!
    return true;
  }

  score(rescore=false) {
    if(rescore || !this.memo_score) {
      const table_scores = _.map((t) => t.score(), this._tables);
      this.memo_score = Math.round(_.sum(table_scores), 5);
    }

    return this.memo_score;
  }

  meta_score() {
    let seat_scores = [];

    for(let t of this._tables) {
      seat_scores = _.concat(seat_scores, t.seat_scores());
    }

    lowest_seat_score = _.min(_.map((s) => s[1], seat_scores));

    return _.sum(_.map((t) => t.meta_score(lowest_seat_score), this._tables));
  }

  record_seating() {
    _.map((t) => t.record_seats(), this._tables);
  }

  get_unlocked_seats() {
    const unlocked_seats = _.map((t) => t.get_unlocked_seats(), this._tables);
    return _.reduce(unlocked_seats, (acc, n) => _.concat(acc, n), []);
  }

  unlock_seats() {
    _.map((t) => t.unlock_seats(), this._tables);
  }

  get_player_names() {
    const names_at_tables = _.map((t) => t.get_player_names(), this._tables);A
    return _.reduce(names_at_tables, (acc, n) => _.uniq(_.concat(acc, n)), []);
  }

  generate_tables(num_unseated, max_seats, min_seats) {
    this._tables = []

    while(num_unseated > 0) {
      const to_seat = 0;

      if(num_unseated % max_seats === 0){
        to_seat = max_seats;
      }
      else if(num_unseated > min_seats) {
        to_seat = min_seats;
      }
      else {
        to_seat = num_unseated;
      }

      const new_seats = []
      for(let i=0; i < to_seat; i++) {
        new_seats.push(new Seat());
      }

      this._tables.push(new Table(new_seats));
    }
  }

  pair_players(players, max_table_size, min_table_size) {
    this.generate_tables(players.length, max_table_size, min_table_size)

    chance.shuffle(players)
    seats = this.get_unlocked_seats()

    while(players) {
      p = players.pop()
      s = seats.pop()

      s.seat_player(p)
    }
  }

  _improve(config) {
      SEAT = 0
      SCORE = 1
      BETTER_THAN_OCCUPIED_PLAYER = 2

      seat_scores = _.reduce(_.map( (t) => t.seat_scores(), this._tables), (acc, n) => _.concat(acc, n), [])
      lowest_score = _.min(_.map((ss) => ss[SCORE], seat_scores))
      bad_seats = _.filter((ss) => ss[SCORE] > lowest_score, seat_scores)

      swapped_players = []

      for(let bad of config.progress(bad_seats)) {
        better_seats = []

        // Find a better seat for this player
        for(let t of this._tables) {
          test_results = t.test_seating_scores(bad[SEAT].get_player())

          for(let res of test_results) {
            if(res[SCORE] < bad[SCORE] && res[BETTER_THAN_OCCUPIED_PLAYER]) {
              better_seats.append(res)
            }
          }
        }


        if(better_seats.length !== 0) {
          new_seat = chance.pickone(better_seats)[SEAT]
          occupied_player = new_seat.get_player()

          if(occupied_player !== null) {
            swapped_players.append(occupied_player)
            new_seat.unseat_player()
          }

          new_seat.seat_player(bad[SEAT].get_player())
        }
        else {
          swapped_players.append(bad[SEAT].get_player())
        }

        bad[SEAT].unseat_player()
      }

      // shuffle players between all unlocked seats
      new_unlocked_seats = this.get_unlocked_seats()
      chance.shuffle(new_unlocked_seats)

      // Randomly seat the swapped out players
      while(swapped_players) {
          player = swapped_players.pop()
          new_seat = new_unlocked_seats.pop()
          new_seat.seat_player(player)
      }
  }

  improve(config) {
    new_round = this.clone()
    new_round._improve(config)

    new_round.unlock_seats()
    new_round.validate()
    return new_round
  }

}
