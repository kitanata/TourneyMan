import Chance from 'chance';
const chance = new Chance();

import Player from './player';

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

        PLAYER_NAME_SEEDS = [
            "ALICE", "BOB", "CHARLIE",
            "DAVID", "ERIN", "FRANK",
            "GARY", "HEATHER", "IMOGEN",
            "JIM", "KAREN", "LINDA",
            "MANNY", "NIGEL", "OREN",
        ]

        this.PLAYER_NAMES = [];
        for(let i=0; i < this.NUM_PLAYERS) {
          this.PLAYER_NAMES.push(`${i}_${chance.pickOne(PLAYER_NAME_SEEDS)}`)
          this.PLAYERS.push(new Player(name));
        }
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
