
export default class SeatingIterationStats {

  constructor(iter_num) {
    this.iteration_num = iter_num;

    this.round = null;
    this.score = 0xFFFFFFFF;
    this.meta_score = 0;
    this.start_time = new Date().getMilliseconds();
    this.finish_time = this.start_time;
  }

  finish() {
    this.finish_time = new Date().getMilliseconds();
  }

  time_elapsed() {
    return Math.round(this.finish_time - this.start_time, 5);
  }

  print_iteration_report() {
    console.log("");
    console.log(`Iteration: #${this.iteration_num}`);
    console.log(`\t Score: ${this.score}`);
    console.log(`\t # Seats Correct: ${this.meta_score}`);
    console.log(`\t Time Elapsed: ${this.time_elapsed()}`);
  }
}
