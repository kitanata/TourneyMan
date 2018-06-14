import { reject, uniq } from 'lodash';

export default class RankingService {

  async get_scores(rank) {
    await rank.fetch_related_set('seat_history');

    const scores = [];
    for(let seat of rank.seat_history.models) {
      scores.push(parseInt(seat.get('score')));
    }

    return scores;
  }

  async get_score_pcts(rank) {
    await rank.fetch_related_set('seat_history');

    const score_pcts = [];
    for(let seat of rank.seat_history.models) {
      await seat.fetch_related_model('table');
      await seat.table.fetch_related_set('seats');

      let total_table_score = 0;
      for(let s of seat.table.seats.models) {
        total_table_score += parseInt(s.get('score'));
      }

      const seat_score = parseInt(seat.get('score'));

      if(total_table_score !== 0) {
        score_pcts.push(seat_score / total_table_score);
      } else {
        score_pcts.push(1);
      }
    }

    return score_pcts;
  }

  async get_num_wins(rank) {
    await rank.fetch_related_set('seat_history');

    let num_wins = 0;
    for(let seat of rank.seat_history.models) {
      if(seat.get('won') === true) {
        num_wins += 1;
      }
    }

    return num_wins;
  }

  async update_competitor_history(seat, table) {
    await seat.fetch_related_model('rank');

    const rank = seat.rank;

    let competitors = table.seats.map((s) => s.get('rank_id'));
    competitors = reject(competitors, (id) => id === rank.get_id());

    const history = rank.get('competitor_history_ids');

    rank.set('competitor_history_ids', uniq(history.concat(competitors)));

    return rank.save();
  }

  async update_seat_history(seat) {
    await seat.fetch_related_model('rank');

    seat.rank.add_related_to_set('seat_history', seat);

    return seat.rank.save();
  }
}
