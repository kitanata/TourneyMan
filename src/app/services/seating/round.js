import Chance from 'chance';
import _ from 'lodash';

import logger from '../../framework/logger';

import Seat from './seat';
import Table from './table';

const chance = new Chance();

export default class Round {

  constructor(players=[], tables=[]) {
    this._tables = tables;
    this.players = players;

    this.memo_score = null;
  }

  to_str() {
    let value = "";

    for(let num in this._tables) {
      const table = this._tables[num];
      value += `TABLE #${num}\n${table.to_str()}\n`;
    }

    return value
  }

  to_repr() {
    return this.to_str();
  }

  get_arrangement() {
    return this._tables.slice(0);
  }

  count() {
    return this._tables.length;
  }

  num_seats() {
    return _.sum(_.map(this._tables, (t) => t.count()));
  }

  clone() {
    const tables = _.map(this._tables, (t) => t.clone());
    return new Round(this.players, tables)
  }

  validate() {
    const all_player_ids = _.map(this.players, (r) => r.get('player_id'));
    const player_ids_at_tables = this.get_player_ids()

    if(_.uniq(player_ids_at_tables).length !== all_player_ids.length) {
      logger.error("Round Validation Failed");
    }
  }

  count_tables_of_size(num_seats) {
    return _.filter(this._tables, (t) => t.count() === num_seats).length;
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
      const table_scores = _.map(this._tables, (t) => t.score());
      this.memo_score = Math.round(_.sum(table_scores), 5);
    }

    return this.memo_score;
  }

  meta_score() {
    let seat_scores = [];

    for(let t of this._tables) {
      seat_scores = _.concat(seat_scores, t.seat_scores());
    }

    const lowest_seat_score = _.min(_.map(seat_scores, (s) => s[1]));

    return _.sum(_.map(this._tables, (t) => t.meta_score(lowest_seat_score)));
  }

  record_seating() {
    _.map((t) => t.record_seats(), this._tables);
  }

  get_unlocked_seats() {
    const unlocked_seats = _.map(this._tables, (t) => t.get_unlocked_seats());
    return _.reduce(unlocked_seats, (acc, n) => _.concat(acc, n), []);
  }

  unlock_seats() {
    _.map(this._tables, (t) => t.unlock_seats());
  }

  get_player_ids() {
    const ids_at_tables = _.map(this._tables, (t) => t.get_player_ids());
    return _.reduce(ids_at_tables, (acc, n) => _.uniq(_.concat(acc, n)), []);
  }

  generate_tables(num_unseated, max_seats, min_seats) {
    this._tables = []

    while(num_unseated > 0) {
      let to_seat = 0;

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

      num_unseated -= to_seat;
    }
  }

  pair_players(max_table_size, min_table_size) {
    const players = _.shuffle(this.players.slice(0)); //copy the array

    this.generate_tables(players.length, max_table_size, min_table_size)

    const seats = this.get_unlocked_seats()

    while(players.length !== 0) {
      const p = players.pop();
      const s = seats.pop();

      s.seat_player(p);
    }
  }

  _improve(config) {
    const SEAT = 0;
    const SCORE = 1;
    const BETTER_THAN_OCCUPIED_PLAYER = 2;

    const seat_scores = _.reduce(_.map(this._tables, (t) => t.seat_scores()), (acc, n) => _.concat(acc, n), []);
    const lowest_score = _.min(_.map(seat_scores, (ss) => ss[SCORE]));
    const bad_seats = _.filter(seat_scores, (ss) => ss[SCORE] > lowest_score);

    const swapped_players = [];

    for(let bad of bad_seats) {
      const better_seats = [];

      // Find a better seat for this player
      for(let t of this._tables) {
        const test_results = t.test_seating_scores(bad[SEAT].get_player());

        for(let res of test_results) {
          if(res[SCORE] < bad[SCORE]) {// && res[BETTER_THAN_OCCUPIED_PLAYER]) {
            better_seats.push(res);
          }
        }
      }


      if(better_seats.length !== 0) {
        const new_seat = chance.pickone(better_seats)[SEAT];
        const occupied_player = new_seat.get_player();

        if(occupied_player !== null) {
          swapped_players.push(occupied_player);
          new_seat.unseat_player();
        }

        new_seat.seat_player(bad[SEAT].get_player());
      }
      else {
        swapped_players.append(bad[SEAT].get_player());
      }

      bad[SEAT].unseat_player();
    }

    // shuffle players between all unlocked seats
    const new_unlocked_seats = _.shuffle(this.get_unlocked_seats());

    // Randomly seat the swapped out players
    while(swapped_players.length !== 0) {
      const player = swapped_players.pop();
      const new_seat = new_unlocked_seats.pop();
      new_seat.seat_player(player)
    }
  }

  improve(config) {
    const new_round = this.clone();
    new_round._improve(config);

    new_round.unlock_seats();
    new_round.validate();
    return new_round;
  }

}
