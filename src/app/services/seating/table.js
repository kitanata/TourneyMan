import _ from 'lodash';

import Seat from './seat';

export default class Table {

  constructor(seats=null) {
    this._seats = seats || []
  }

  to_str() {
    let value = ""

    for(let pos in this._seats) {
      const seat = this._seats[pos];
      value += `\tSeat # ${pos} \t|\t${seat}\n`;
    }

    return value;
  }

  to_repr() {
    return this.to_str();
  }

  count() {
    return this._seats.length;
  }

  get_arrangement() {
    return this._seats.slice(0);
  }

  score() {
    return _.sum(_.map(this.seat_scores(), (s) => s[1]));
  }

  seat_scores() {
    const seated_player_ids = this.get_player_ids()
    const seat_cnt = this.count();

    const scores = [];

    for(let idx in this._seats) {
      const seat = this._seats[idx];
      const seat_pos = parseInt(idx) + 1;

      scores.push([seat, seat.score(seat_pos, seat_cnt, seated_player_ids)]);
    }


    return scores;
  }

  meta_score(lowest_seat_score) {
    const seated_player_ids = this.get_player_ids()
    const seat_cnt = this._seats.length;

    let total_score = 0;

    for(let idx in this._seats) {
      const seat = this._seats[idx];
      const seat_pos = parseInt(idx) + 1;

      total_score += seat.meta_score(lowest_seat_score, seat_pos, seat_cnt, seated_player_ids);
    }

    return total_score;
  }

  test_seating_scores(test_player) {
    const seated_player_ids = this.get_player_ids();
    const seat_cnt = this.count();

    const candidates = [];

    for(let idx in this._seats) {
      const seat = this._seats[idx];
      const seat_pos = parseInt(idx) + 1;

      const tmp_player = seat.get_player();

      let cur_score = 0xFFFFFFFF;
      if(tmp_player !== null) {
        cur_score = seat.score(seat_pos, seat_cnt, seated_player_ids);
      }

      seat.replace_player(test_player);
      const sim_score = seat.score(seat_pos, seat_cnt, seated_player_ids);
      seat.unseat_player();

      if(tmp_player !== null) {
        seat.seat_player(tmp_player);
      }

      candidates.push([seat, sim_score, sim_score <= cur_score])
    }

    return candidates;
  }

  get_player_ids() {
    return _.uniq(_.map(this._seats, (s) => s.player_id()));
  }

  clone() {
    const cloned_seats = _.map(this._seats, (s) => s.clone());
    return new Table(cloned_seats);
  }

  record_seating() {
    const competitors = this.get_player_ids()

    for(let pos in this._seats) {
      const seat = this._seats[pos];
      const seat_competitors = _.difference(competitors, [seat.player_id()]);

      seat.record_player(pos, seat_competitors);
    }
  }

  get_unlocked_seats() {
    return _.filter(this._seats, (s) => !s.is_locked());
  }

  lock_seats() {
    for(let seat of this._seats) {
      seat.lock();
    }
  }

  unlock_seats() {
    for(let seat of this._seats) {
      seat.unlock();
    }
  }
}
