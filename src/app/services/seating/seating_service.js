import _ from 'lodash';
import Round from './round';

export default class SeatingService {

  constructor(config, stats) {
    this.config = config
    this.stats = stats
  }

  check_early_exit() {
    // check if last X iterations are the same, if so end early
    if not this.config.END_EARLY_CONSISTENT:
      return false

    rounds = this.stats.get_rounds()

    if len(rounds) < this.config.ITERATION_CONS:
      return false

    last_score = _.last(rounds).score()
    scores = _.map((r) => r.score(), _.takeRight(rounds, this.config.ITERATION_CONS))

    if Math.round(_.sum(scores) / this.config.ITERATION_CONS, 5) == last_score:
      return true

    return false
  }

  run(round_num) {
    // initialize round pool
    this.config.log("Generating Initial Seating Arrangement")

    cur_round = Round(players=this.config.PLAYERS)
    cur_round.pair_players(
      list(this.config.PLAYERS), 
      this.config.SEATS_PER_TABLE,
      this.config.MIN_SEATS_PER_TABLE)

    should_converge = cur_round.should_converge(round_num, this.config)

    // iterate some number of times
    for(let i = 0; i < this.config.MAX_ITERATIONS; i++) {
      iter_stats = this.stats.create_iteration()

      this.stats.record_round(cur_round)

      // if any are 0, then done.
      this.config.log("Checking for Global Minimum.")
      if this.stats.did_converge(this.config.NUM_PLAYERS):
        return cur_round

      this.config.log("Checking for early exit.")
      if not should_converge and this.check_early_exit():
        return cur_round

      this.config.log("Improving Seating Assignments")
      new_round = cur_round.improve(this.config)

      if new_round.score() <= cur_round.score():
        cur_round = new_round

      this.stats.finish_iteration()

      if this.config.DEBUG:
        iter_stats.print_iteration_report()
    }

    cur_round.validate()

    return cur_round
  }

}
