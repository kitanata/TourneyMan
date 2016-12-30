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
      player_name: "",
      tables: []
    }

    this.events = {
      "click": {
        ".move_player": (el) => this.onMovePlayerClicked(el)
      }
    }
  }

  pre_render() {
    console.log("MovePlayerDialog::pre_render()");

    this.seat = new Seat();

    this.seat.fetch_by_id(this.seat_id)
      .then( () => {
        return this.seat.fetch_related();
      })
      .then( () => {
        return this.seat.rank.fetch_related_model('player');
      })
      .then( () => {
        this.model.player_name = this.seat.rank.player.get('name');
        this.model.table_number = this.seat.table.get('table_number');
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

          if(t.get_id() === this.seat.table.get_id())
            return;

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
      })
      .then( () => {
        this.rebind_events();
      });
  }

  onMovePlayerClicked(el) {
    console.log("MovePlayerDialog::onMovePlayerSubmitClicked");
    let table_id = $(el.currentTarget).data('id');

    let old_table = null;
    let table = new Table();

    this.start_progress("Moving the player to another table.");

    this.seat.fetch_related_model('table')
      .then( () => {
        old_table = this.seat.table;
        return old_table.remove_related_from_set('seats', this.seat)
      })
      .then( () => {
        return old_table.save();
      })
      .then( () => {
        return old_table.fetch_related_set('seats');
      })
      .then( () => {
        let pos = 1;
        return old_table.seats.each( (s) => {
          s.set('position', pos);
          pos += 1;

          return s.save();
        });
      })
      .then( () => {
        return table.fetch_by_id(table_id);
      })
      .then( () => {
        return table.fetch_related_set('seats');
      })
      .then( () => {
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

        return Promise.all([this.seat.save(), table.save()]);
      })
      .then( () => {
        return this.finish_progress();
      })
      .then( () => {
        this.close();
      });
  }
}
