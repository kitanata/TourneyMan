
export default class RoundService {

  async start_round(round) {
    round.set("started", true);

    await round.save();
  }

  async finish_round(round) {
    if(round.get('finished'))
      return;

    await round.fetch_related();

    for(let t of round.tables.models) {
      await t.fetch_related_set('seats');
      
      let scores = t.seats.map((s) => s.get('score'));
      let score_sum = _.sum(scores);

      for(let s of t.seats.models) {
        await s.fetch_related_model('rank');

        let rank_scores = s.rank.get('scores');
        let rank_score_pcts = s.rank.get('score_pcts');
        let rank_num_wins  = s.rank.get('num_wins');

        let seat_score = s.get('score');

        rank_scores.push(seat_score);
        rank_score_pcts.push(seat_score / score_sum);

        if(s.get('won') == true) {
          rank_num_wins += 1;
        }

        s.rank.set('scores', rank_scores);
        s.rank.set('score_pcts', rank_score_pcts);
        s.rank.set('num_wins', rank_num_wins);

        await s.rank.save();
      }
    }

    round.set('finished', true);
    await round.save();
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
