import _ from 'lodash';

import Seat from 'seat';

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

  score() {
    const seat_names = this.get_player_names();
    const seat_cnt = this.count();

    let total_score = 0

    for(let seat_pos in this._seats) {
      const seat = this._seats[seat_pos];

      total_score += seat.score(seat_pos, seat_cnt, seat_names)
    }

    return total_score;
  }

  seat_scores() {
    const seat_names = this.get_player_names()
    const seat_cnt = this.count();

    const scores = [];

    for(let seat_pos in this._seats) {
      const seat = this._seats[seat_pos];

      scores.push((seat, seat.score(seat_pos, seat_cnt, seat_names)));
    }


    return scores;
  }

  meta_score(lowest_seat_score) {
    const seat_names = this.get_player_names()
    const seat_cnt = len(this._seats)

    let total_score = 0;

    for(let seat_pos in this._seats) {
      const seat = this._seats[seat_pos];

      total_score += seat.meta_score(lowest_seat_score, seat_pos, seat_cnt, seat_names);
    }

    return total_score;
  }

  test_seating_scores(test_player) {
    const seat_names = this.get_player_names();
    const seat_cnt = this.count();

    const candidates = [];

    for(let seat_pos in this._seats) {
      const seat = this._seats[seat_pos];

      const tmp_player = seat.get_player();

      let cur_score = 0xFFFFFFFF;
      if(tmp_player !== null) {
        cur_score = seat.score(seat_pos, seat_cnt, seat_names);
      }

      seat.replace_player(test_player);
      const sim_score = seat.score(seat_pos, seat_cnt, seat_names);
      seat.unseat_player();

      if(tmp_player !== null) {
        seat.seat_player(tmp_player);
      }

      candidates.push((seat, sim_score, sim_score <= cur_score))
    }

    return candidates;
  }

  get_player_names() {
    return _.uniq(_.map(this._seats, (s) => s.player_name()));
  }

  clone() {
    const cloned_seats = _.map(this._seats, (s) => s.clone());
    return new Table(cloned_seats);
  }

  record_seating() {
    const competitors = this.get_player_names()

    for(let pos in this._seats) {
      const seat = this._seats[pos];
      const seat_competitors = _.difference(competitors, [seat.player_name()]);

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
