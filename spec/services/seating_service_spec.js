import { expect } from 'chai';

import Global from '../../src/app/framework/global';

import { User } from '../../src/app/models/user';
import { Event } from '../../src/app/models/event';
import { Round } from '../../src/app/models/round';

import UserService from '../../src/app/services/user_service';
import EventService from '../../src/app/services/event_service';
import RoundService from '../../src/app/services/round_service';
import TableService from '../../src/app/services/table_service';
import SeatingService from '../../src/app/services/seating_service';

const global = Global.instance();

describe("SeatingService", () => {
  context("an event with 2 rounds and 8 players", () => {
    it("no player in the first round should be seated with the same opponents in the second round", async () => {
      const event_service = new EventService();
      const seating_service = new SeatingService();
      const round_service = new RoundService();
      const table_service = new TableService();

      global.user = new User();
      global.user.create();

      // 1. Create a random event.
      const event = new Event();
      event.create();

      event_service.randomize(event);

      // 2. Create 2 rounds for the event.
      const round1 = new Round();
      round1.create();

      const round2 = new Round();
      round2.create();

      // 3. Add rounds to the event.
      await event_service.add_round(event, round1);
      await event_service.add_round(event, round2);

      // 4. Create 8 players and register them for the event.
      for(let i=0; i < 8; i++) {
        const new_player = new User();
        new_player.create();
        await new_player.save();
        await event_service.register_player(event, new_player);
      }

      // 5. Start the event.
      await event_service.start_event(event);

      // 6. Seat the players in the first round.
      const r1_tables = await table_service.generate_tables(8);
      await table_service.assign_tables_to_round(r1_tables, round1);

      await round1.event.fetch_related_set('ranks');

      await seating_service.seat_players(r1_tables, round1.event.ranks);

      // 7. Play the round.
      await round_service.start_round(round1);
      await round_service.randomize_scores(round1);
      await round_service.finish_round(round1);

      // 8. Seat the players in the second round.
      const r2_tables = await table_service.generate_tables(8);
      await table_service.assign_tables_to_round(r2_tables, round2);

      await round2.event.fetch_related_set('ranks');

      await seating_service.seat_players(r2_tables, round2.event.ranks);

      // Expectations
      for(let table of r2_tables.models) {
        const seated_ranks = [];
        const seated_rank_ids = [];

        for(let seat of table.seats.models) {
          await seat.fetch_related_model('rank');

          seated_ranks.push(seat.rank);
          seated_rank_ids.push(seat.rank.get_id());
        };

        for(let rank of seated_ranks) {
          console.log(rank.get('competitor_history_ids'));
          const competitor_history = rank.get('competitor_history_ids');

          expect(competitor_history.length).to.eq(3);

          for(let competitor_id of competitor_history) {
            console.log(`Checking if competitor: ${competitor_id} is in ${seated_rank_ids}`);
            expect(seated_rank_ids).to.not.include(competitor_id);
          }
        }
      }

      // 1. No player should be in the same seat position they were in the 
      // first round. 1 => 4 2 => 3 3 => 2 4 => 1
      // 2. Each player should not be playing against anyone they played with
      // in the previous round.
    });
  });
});
