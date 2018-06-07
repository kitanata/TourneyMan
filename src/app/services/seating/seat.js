import _ from 'lodash';

import logger from '../../../framework/logger';

SWT1 = 0.2
SWT2 = 0.5

CWT1 = 0.2
CWT2 = 0.5

export default class Seat {

  constructor(player=null, locked=false) {
    this._player = player;
    this._locked = locked;

    this._dirty = true;
    this._memo_score = null;
  }

  to_str() {
    const name = this._player.name || "None";
    return `${name}\t|\t${this._locked}`;
  }

  to_repr() {
    const name = this._player.name || "None";
    return `<Seat player.name=${name} locked=${this._locked}>`'
  }

  clone() {
    return new Seat(player=this._player, locked=this._locked)
  }

  lock() {
    this._locked = true;
    this._dirty = true;
  }

  unlock() {
    this._locked = false;
    this._dirty = true;
  }

  is_locked() {
    return this._locked === true; //do not give write access to _locked
  }

  get_player() {
    return this._player;
  }

  record_player(seat_pos, competitors) {
    this._player.seat_hist.push(seat_pos);
    this._player.comp_hist = _.concat(this._player.comp_hist, competitors);
  }

  player_name() {
    return this._player.name || "None";
  }

  player_seat_history() {
    return this._player.seat_hist;
  }

  player_competitor_history() {
    return this._player.comp_hist;
  }

  seat_player(player) {
    if this.is_locked():
      logger.error("Seat is locked, and cannot be mutated.")

    this._player = player;
    this._locked = true;
    this._dirty = true;
  }

  replace_player(player) {
    this._player = player;
    this._locked = true;
    this._dirty = true;
  }

  unseat_player() {
    this._player = null;
    this._locked = false;
    this._dirty = true;
  }

  meta_score(lowest_seat_score, seat_pos, seat_cnt, seat_names) {
    const my_score = this.score(seat_pos, seat_cnt, seat_names);

    return my_score == lowest_seat_score ? 1 : 0;
  }

  score(seat_pos, seat_cnt, seat_names) {
    if(this._dirty) {
      this._memo_score = this._score(seat_pos, seat_cnt, seat_names);
      this._dirty = false;
    }

    return this._memo_score
  }

  _score(seat_pos, seat_cnt, seat_names) {
    sv = this._seat_history_comp_score(seat_pos, seat_cnt):
    cv = this._competitor_history_comp_score(seat_names);

    sv2 = sv * sv;
    cv2 = cv * cv;

    svt = SWT1 * sv2 + SWT2 * sv + sv;
    cvt = CWT1 * cv2 + CWT2 * cv + cv;

    svt2 = svt * svt;
    cvt2 = cvt * cvt;

    return svt + cvt + svt * cvt + svt2 + cvt2;
  }

  _seat_history_comp_score(seat_pos, seat_cnt) {
    const player_seat_history = this.player_seat_history();
    seat_cnt = _.min(player_seat_history.length, seat_cnt - 1);

    const seat_history = _.takeRight(player_seat_history, seat_cnt);
    const sv = _.filter((x) => x === seat_pos, seat_history).length;

    return seat_cnt !== 0 ? sv / seat_cnt : 0;
  }

  _competitor_history_comp_score(seat_names) {
    const player_competitor_history = this.player_competitor_history();

    const cv = _.filter((comp) => _.includes(seat_names, comp), player_competitor_history).length;
    const denom = player_competitor_history.length;

    return denom !== 0 ? cv / denom : 0;
  }

}
