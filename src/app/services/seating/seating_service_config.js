
export default class SeatingServiceConfig {

  constructor(num_players=48) {
    this.DEBUG = true;

    this.NUM_PLAYERS = num_players;
    this.SEATS_PER_TABLE = 4;
    this.MIN_SEATS_PER_TABLE = 3;

    this.MAX_ITERATIONS = 1000;

    this.END_EARLY_CONSISTENT = true;
    this.ITERATION_CONS = 100;

    this.CLASH_MUTATION_SIZE = 25;

    this.PLAYERS = "DEPRECATED <PLAYERS> from config!";
    this.PLAYER_NAMES = "DEPRECATED <PLAYER_NAMES> from config!";
  }

  print_players() {
    if(!this.DEBUG) {
      return;
    }

    for(let p of this.PLAYERS) {
      console.log(`${p.name}\t SEATS: ${p.seat_hist}`);
      console.log(`${p.name}\t COMPETITORS: ${p.comp_hist}`);
    }
  }
}
