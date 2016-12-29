'use strict';

class MovePlayerDialog extends DialogView {

  constructor(seat_id) {
    super();

    this.title = "Move Player";
    this.template = "move-player-dialog";

    this.seat_id = seat_id;
    this.seat = null;
    this.round = null;

    this.model = { 
      seat: null,
      table: null,
      rank: null
    }

    this.events = {
      "click": {
        ".move_player_submit": () => this.onMovePlayerSubmitClicked()
      }
    }
  }

  pre_render() {
    console.log("MovePlayerDialog::pre_render()");
    console.log(this.seat_id);

    this.seat = new Seat();

    this.seat.fetch_by_id(this.seat_id)
      .then( () => {
        return this.seat.fetch_related_model('table');
      })
      .then( () => {
        return this.seat.table.fetch_related_model('round');
      })
      .then( () => {
        this.round = this.seat.table.round;
        return this.round.fetch_related_set('tables');
      })
      .then( () => {
        console.log(this.round);
        this.model.tables = [];

        return this.round.tables.each( (t) => {
          let table_vm = t.to_view_model();
          table_vm.players = [];

          return t.fetch_related_set('seats')
            .then( () => {
              return t.seats.each( (s) => {
                return s.fetch_related_model('rank')
                  .then( () => {
                    return s.rank.fetch_related_model('player')
                  })
                  .then( () => {
                    table_vm.players.push({
                      name: s.rank.player.get('name')
                    });
                  });
              });
            })
            .then( () => {
              this.model.tables.push(table_vm);
            });
        });
      });
  }

  onMovePlayerSubmitClicked() {
    console.log("MovePlayerDialog::onMovePlayerSubmitClicked");
  }
}
