import RankingService from './ranking_service';

import Chance from 'chance';
import { sum } from 'lodash';

const chance = new Chance();

export default class RoundService {

  async start_round(round) {
    round.set("started", true);

    await round.save();
  }

  async finish_round(round) {
    if(round.get('finished'))
      return;

    const ranking_service = new RankingService();

    await round.fetch_related();

    for(let t of round.tables.models) {
      await t.fetch_related_set('seats');
      
      for(let s of t.seats.models) {
        await ranking_service.update_competitor_history(s, t);
        await ranking_service.update_seat_history(s);
      }
    }

    round.set('finished', true);
    return round.save();
  }

  async randomize_scores(round) {
    await round.fetch_related_set('tables');

    for(let t of round.tables.models) {
      let winning_seat = null;
      let winning_score = -1;

      await t.fetch_related_set('seats');

      for(let s of t.seats.models) {
        let score = chance.integer({min: 0, max: 20});

        if(score > winning_score) {
          winning_seat = s;
          winning_score = score;
        }

        s.set("score", score);
        s.set("won", false);
        await s.save();
      }

      winning_seat.set('won', true);
      await winning_seat.save();
    }
  }

};
