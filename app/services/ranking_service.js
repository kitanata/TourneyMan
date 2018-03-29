import { reject, uniq } from 'lodash';

export default class RankingService {

  async finalize_score(seat, table_total_score) {
    await seat.fetch_related_model('rank');

    let rank_scores = seat.rank.get('scores');
    let rank_score_pcts = seat.rank.get('score_pcts');
    let rank_num_wins  = seat.rank.get('num_wins');

    let seat_score = seat.get('score');

    rank_scores.push(seat_score);
    rank_score_pcts.push(seat_score / table_total_score);

    if(seat.get('won') == true) {
      rank_num_wins += 1;
    }

    seat.rank.set('scores', rank_scores);
    seat.rank.set('score_pcts', rank_score_pcts);
    seat.rank.set('num_wins', rank_num_wins);

    return seat.rank.save();
  }

  async update_competitor_history(seat, table) {
    await seat.fetch_related_model('rank');

    const rank = seat.rank;

    let competitors = table.seats.map((s) => s.get('rank_id'));
    competitors = reject(competitors, (id) => id === rank.get_id());

    let history = rank.get('competitor_history_ids');
    rank.set('competitor_history_ids', uniq(history + competitors));

    return rank.save();
  }
}
