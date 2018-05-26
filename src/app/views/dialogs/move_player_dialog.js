'use strict';

import DialogView from '../../framework/dialog_view';

export default class MovePlayerDialog extends DialogView {

  constructor(seat_id) {
    super();

    this.title = "Move Player";
    this.template = "move-player-dialog";

    this.seat_id = seat_id;
    this.seat = null;
    this.round = null;

    this.model = { 
      player_name: "",
      tables: []
    }

    this.events = {
      "click": {
        ".move_player": (el) => this.onMovePlayerClicked(el)
      }
    }
  }

  async pre_render() {
    console.log("MovePlayerDialog::pre_render()");

    this.seat = new Seat();

    await this.seat.fetch_by_id(this.seat_id);
    await this.seat.fetch_related();
    await this.seat.rank.fetch_related_model('player');

    this.model.player_name = this.seat.rank.player.get('name');
    this.model.table_number = this.seat.table.get('table_number');
    await this.seat.table.fetch_related_model('round');

    this.round = this.seat.table.round;
    await this.round.fetch_related_set('tables');

    console.log(this.round);
    this.model.tables = [];

    for(let t of this.round.tables.models) {
      let table_vm = t.to_view_model();
      table_vm.players = [];

      if(t.get_id() === this.seat.table.get_id())
        return;

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

  async onMovePlayerClicked(el) {
    console.log("MovePlayerDialog::onMovePlayerSubmitClicked");
    let table_id = $(el.currentTarget).data('id');

    let old_table = null;
    let table = new Table();

    this.start_progress("Moving the player to another table.");

    await this.seat.fetch_related_model('table');

    old_table = this.seat.table;
    await old_table.remove_related_from_set('seats', this.seat)
    await old_table.save();
    await old_table.fetch_related_set('seats');

    let pos = 1;
    for(let s of old_table.seats.models) {
      s.set('position', pos);
      pos += 1;

      await s.save();
    }

    await table.fetch_by_id(table_id);
    await table.fetch_related_set('seats');

    let positions = table.seats.map( (s) => { 
      return s.get('position');
    });

    for(let i=1; i < 100; i++) {
      if(_.includes(positions, i))
        continue;

      this.seat.set('position', i);
      break;
    }

    this.seat.table = table;
    table.add_related_to_set('seats', this.seat);

    await this.seat.save();
    await table.save();

    await this.finish_progress();
    this.close();
  }
}
