'use strict';

class SeatPlayerDialog extends DialogView {

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

  pre_render() {
    console.log("SeatPlayerDialog::pre_render()");

    this.rank = new Rank();

    this.rank.fetch_by_id(this.rank_id)
      .then( () => {
        return this.rank.fetch_related_model('player');
      })
      .then( () => {
        this.model.player_name = this.rank.player.get('name');
      })
      .then( () => {
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
      })
      .then( () => {
        this.rebind_events();
      });
  }

  onSeatPlayerClicked(el) {
    console.log("SeatPlayerDialog::onSeatPlayerSubmitClicked");
    let table_id = $(el.currentTarget).data('id');

    let table = new Table();
    let new_seat = new Seat();
    new_seat.create();

    this.start_progress("Seating the player at the table.");

    return table.fetch_by_id(table_id)
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

          new_seat.set('position', i);
          break;
        }

        new_seat.table = table;
        new_seat.rank = this.rank;

        table.add_related_to_set('seats', new_seat);

        return Promise.all([new_seat.save(), table.save()]);
      })
      .then( () => {
        return this.finish_progress();
      })
      .then( () => {
        this.close();
      });
  }
}
