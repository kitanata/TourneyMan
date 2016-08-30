'use strict';

class Table {
  constructor(positions, table_num) {
    this.id = chance.guid();
    this.positions = positions;
    this.table_number = table_num;
    this.full_table = false;

    this.players = [];
    this.scores = [];

    for(let i=0; i < positions; i++)
      this.players.push(null);
  }

  seat_player(player) {
    if(this.full_table) return false;

    for(let i=0; i < this.players.length; i++) {
      if(!this.players[i]) {
        player.position = i;
        this.players[i] = player;

        if(i == this.positions - 1)
          this.full_table = true;
      
        return true;
      }
    }

    return false;
  }

  record_scores(scores) {
    this.scores = scores;
  }

  get_player(position) {
    return this.players[position];
  }
}

