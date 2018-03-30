import { reject } from 'lodash';
import { expect } from 'chai';

import RankingService from '../../app/services/ranking_service';
import { Table } from '../../app/models/table';
import { User } from '../../app/models/user';
import { Rank } from '../../app/models/rank';
import { Seat } from '../../app/models/seat';

describe("RankingService", () => {
  it("should exist", () => {
    const subject = new RankingService();

    expect(subject).to.not.be.undefined;
  });

  context("#update_competitor_history", () => {
    context("after one round", () => {
      it("should set the competitor history correctly", async () => {
        const table = new Table();
        table.create();

        let rank_ids = [];
        for(let i=0; i < 4; i++) {
          const player = new User();
          player.create();
          await player.save();

          const rank = new Rank();
          rank.create();
          rank.player = player;
          await rank.save();
          rank_ids.push(rank.get_id());

          const seat = new Seat();
          seat.create();
          seat.rank = rank;
          seat.table = table;
          await seat.save();

          table.add_related_to_set('seats', seat);
        }

        await table.save();

        const service = new RankingService();
        const subject = table.seats.models[0];
        rank_ids = reject(rank_ids, (n) => n === subject.rank.get_id())
        
        await service.update_competitor_history(subject, table);

        const competitors = subject.rank.get('competitor_history_ids');

        for(let id of rank_ids) {
          expect(competitors).to.include(id);
        }
      });
    });
  });
});
