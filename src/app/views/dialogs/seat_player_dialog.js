'use strict';

import DialogView from '../../framework/dialog_view';
import logger from '../../framework/logger';

export default class SeatPlayerDialog extends DialogView {

  constructor(rank_id, round) {
    super();

    this.title = "Seat Player";
    this.template = "seat-player-dialog";

    this.rank_id = rank_id;
    this.rank = null;
    this.round = round;

    this.model = { 
      player_name: "",
      tables: []
    }

    this.events = {
      "click": {
        ".seat_player": (el) => this.onSeatPlayerClicked(el)
      }
    }
  }

  async pre_render() {
    logger.info("SeatPlayerDialog::pre_render()");

    this.rank = new Rank();

    await this.rank.fetch_by_id(this.rank_id);
    await this.rank.fetch_related_model('player');

    this.model.player_name = this.rank.player.get('name');
    await this.round.fetch_related_set('tables');

    logger.debug(this.round);
    this.model.tables = [];

    for(let t of this.round.tables.models) {
      let table_vm = t.to_view_model();
      table_vm.players = [];

      await t.fetch_related_set('seats');
      for(let s of t.seats.models) {
        await s.fetch_related_model('rank');
        await s.rank.fetch_related_model('player');

        table_vm.players.push({
          name: s.rank.player.get('name')
        });
      }

      this.model.tables.push(table_vm);
    }
  }

  async onSeatPlayerClicked(el) {
    logger.info("SeatPlayerDialog::onSeatPlayerSubmitClicked");
    let table_id = $(el.currentTarget).data('id');

    let table = new Table();
    let new_seat = new Seat();
    new_seat.create();

    this.start_progress("Seating the player at the table.");

    await table.fetch_by_id(table_id);
    await table.fetch_related_set('seats');

    let positions = table.seats.map( (s) => { 
      return s.get('position');
    });

    for(let i=1; i < 100; i++) {
      if(_.includes(positions, i))
        continue;

      new_seat.set('position', i);
      break;
    }

    new_seat.table = table;
    new_seat.rank = this.rank;

    table.add_related_to_set('seats', new_seat);

    await new_seat.save();
    await table.save();

    await this.finish_progress();
    this.close();
  }
}
