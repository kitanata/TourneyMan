import { filter, shuffle, takeRight, indexOf, pull } from 'lodash';
import Chance from 'chance';

import { Ranks } from '../models/rank';

const chance = new Chance();

export default class SeatingService {

  async seat_players(tables, rank_collection) {
    let ranks = rank_collection.models.slice(0); //copy the array

    ranks = filter(ranks, (r) => !r.get('dropped'));
    ranks = new Ranks(shuffle(ranks));

    for(let r of ranks.models) {
      await r.fetch_related(); 
    }

    // for each table not yet full
    let seats_to_save = [];

    while(true) {
      let cur_table = tables.models.shift()

      if(cur_table === undefined) {
        break;
      }

      // score each player for each seat
      let scores = []
      for(let player_rank of ranks.models) {
        scores = scores.concat(
          this.score_table_seat_fitness(player_rank, cur_table)
        );
      }

      // keep the highest scores.
      let best_seats = [];
      let best_score = -5000;

      for(let score of scores) {
        if(score.score > best_score) {
          best_seats = [score];
          best_score = score.score;
        }
        else if(score.score == best_score) {
          best_seats.push(score);
        }
      }

      // choose a random seat of the best seating combinations
      let seat_score = chance.pickone(best_seats);
      seat_score.seat.rank = seat_score.rank;
      ranks.remove(seat_score.rank);

      seats_to_save.push(seat_score.seat);

      // if cur_table is not full add it again
      let open_seats = cur_table.seats.filter((x) => x.rank === undefined);

      if(open_seats.models.length !== 0) {
        tables.push(cur_table);
      }
    }

    for(let s of seats_to_save) {
      await s.save();
    }
  }

  score_table_seat_fitness(player_rank, table) {

    let unoccupied_seats = table.seats.filter((x) => x.rank === undefined);

    let prev_positions = player_rank.seat_history.map((x) => {
      x.get('position');
    });

    prev_positions = takeRight(prev_positions, 3);

    let unoccupied_positions = unoccupied_seats.map((x) => x.get('position'));

    let comp_ids = player_rank.get('competitor_history_ids');
    comp_ids = takeRight(comp_ids, 3);

    let occupied_player_ids = table.seats.map((s) => {
      if(s.rank)
        return s.rank.player_id;

      return -1;
    });

    occupied_player_ids = pull(occupied_player_ids, -1);

    let comp_not_yet_encountered_ids = pull(occupied_player_ids, comp_ids);

    // 2 points for each competitor not encountered in last 3 rounds
    let table_score = comp_not_yet_encountered_ids.length * 2;

    let scores = [];
    for(let cur_seat of unoccupied_seats.models) {
      let seat_pos = cur_seat.get('position');
      let seat_score = indexOf(prev_positions, seat_pos);

      // if not a previous seat will be 3
      // if the last seat will be -9
      // if the second to last will be -6
      // if the third to last will be -3
      seat_score = seat_score * -3;

      scores.push({
        seat: cur_seat,
        rank: player_rank,
        table: table,
        score: seat_score + table_score
      });
    }

    return scores;
  }
}
