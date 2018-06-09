import _ from 'lodash';

import SeatingIterationStats from './seating_iteration_stats';

export default class SeatingServiceStats {

  constructor() {
    this.best_score = 0xFFFFFFFF;
    this.total_iterations = 0;

    this.iteration_stats = [];
    this.current_iteration_stats = null;

    this.start_time = new Date().getMilliseconds();
    this.finish_time = new Date().getMilliseconds();
  }

  create_iteration() {
    this.total_iterations += 1;

    this.current_iteration_stats = new SeatingIterationStats(this.total_iterations);
    this.iteration_stats.push(this.current_iteration_stats);

    return this.current_iteration_stats;
  }

  finish_iteration() {
    this.current_iteration_stats.finish();
  }

  finish() {
    this.finish_time = new Date().getMilliseconds();
  }

  time_elapsed() {
    return Math.round(this.finish_time - this.start_time, 5);
  }

  get_rounds() {
    return _.map(this.iteration_stats, (i) => i.round);
  }

  record_round(cur_round) {
    this.current_iteration_stats.round = cur_round;
    this.current_iteration_stats.score = cur_round.score();
    this.current_iteration_stats.meta_score = cur_round.meta_score();

    if(this.current_iteration_stats.score < this.best_score) {
      this.best_score = this.current_iteration_stats.score;
    }
  }


  did_converge(num_players) {
    return this.current_iteration_stats.meta_score === num_players;

    /*if(this.current_iteration_stats.score !== 0)
      return false;

    if(this.current_iteration_stats.meta_score !== num_players)
      return false;

    return true;*/
  }

  print_exit_report() {
    console.log(`# of Iterations: ${this.total_iterations} Best Score: ${this.best_score} \
      Time Elapsed (s): ${this.time_elapsed()}`)
  }

  plot(title) {
    /*iter_stats = this.iteration_stats
      scores = [iter.score for iter in iter_stats]
      meta_scores = [iter.meta_score for iter in iter_stats]
      time_elapsed = [iter.time_elapsed() * 100 for iter in iter_stats]

      # Data for plotting
      t = range(0, len(iter_stats))

      # Note that using plt.subplots below is equivalent to using
      # fig = plt.figure() and then ax = fig.add_subplot(111)
      fig, ax = plt.subplots()

      ax.scatter(t, scores, alpha=0.5)
      ax.scatter(t, meta_scores, alpha=0.5)
      ax.scatter(t, time_elapsed, alpha=0.5)

      line_best, = ax.plot(t, scores, label="Fitness")
      line_meta, = ax.plot(t, meta_scores, label="# Perfect Seats")
      line_iter_time, = ax.plot(t, time_elapsed, label="Time Elapsed (s) * 100")

      plt.legend(handles=[line_best, line_meta, line_iter_time])

      ax.set(xlabel='Iteration', ylabel='Seating Fitness', title=title)
      ax.grid()

      plt.show()*/
  }
}
