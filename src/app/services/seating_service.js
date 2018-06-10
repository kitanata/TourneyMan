import { filter, takeRight, indexOf, pull } from 'lodash';

import logger from '../framework/logger';

import { Ranks } from '../models/rank';

import Round from './seating/round';

export default class SeatingService {

  constructor(config, stats) {
    this.config = config
    this.stats = stats
  }

  check_early_exit() {
    // check if last X iterations are the same, if so end early
    if(!this.config.END_EARLY_CONSISTENT) {
      return false;
    }

    const rounds = this.stats.get_rounds()

    if(rounds.length < this.config.ITERATION_CONS) {
      return false;
    }

    const last_score = _.last(rounds).score()
    const scores = _.map(_.takeRight(rounds, this.config.ITERATION_CONS), (r) => r.score())

    return _.every(scores, (x) => x === last_score);
  }

  seat_players(rank_collection) {
    const players = rank_collection.models.slice(0); //copy the array

    // initialize round pool
    logger.debug("Generating Initial Seating Arrangement")

    let cur_round = new Round(players);
    cur_round.pair_players(this.config.SEATS_PER_TABLE, this.config.MIN_SEATS_PER_TABLE);

    //NOTE: ranks is now empty. We might need to deep copy this.

    // iterate some number of times
    for(let i = 0; i < this.config.MAX_ITERATIONS; i++) {
      const iter_stats = this.stats.create_iteration()

      this.stats.record_round(cur_round);

      if(this.config.DEBUG) {
        iter_stats.print_iteration_report();
      }

      // if any are 0, then done.
      logger.debug("Checking for Global Minimum.")
      if(this.stats.did_converge(this.config.NUM_PLAYERS)) {
        break;
      }

      logger.debug("Checking for early exit.")
      if(this.check_early_exit()) {
        break;
      }

      logger.debug("Improving Seating Assignments")
      const new_round = cur_round.improve(this.config);

      if(new_round.score() <= cur_round.score()) {
        cur_round = new_round;
      }

      this.stats.finish_iteration()
    }

    debugger;
    cur_round.validate();

    return cur_round;
  }
}
