'use strict';

class TableComponentView extends BaseView {

  constructor(table_id) {
    super();

    this.title = "Table";
    this.template = "table-component";

    this.table = null;
    this.table_id = table_id;

    this.model = {
      'table': {},
      'seats': [],
      'num_seats': 0
    }

    this.events = {
      "click": {
        ".record-scores": (el) => this.onRecordScoresClicked(el),
        ".drop-player": (el) => this.onDropPlayerClicked(el)
      }
    }
  }

  pre_render() {
    console.log("TableComponent::pre_render()");

    this.table = new Table();

    console.log("Fetching table");
    this.table.fetch_by_id(this.table_id)
      .then( () => {
        this.model.table = this.table.to_view_model();
        return this.table.fetch_related();
      })
      .then( () => {
        return this.table.seats.fetch_related();
      })
      .then( () => {
        let promises = [];

        this.table.seats.each( (s) => {
          promises.push(s.rank.fetch_related());
        });

        return Promise.all(promises);
      })
      .then( () => {
        this.model.seats = [];

        this.table.seats.each( (s) => {
          let seat_model = {};

          //flatten it
          seat_model.seat = s.to_view_model();
          seat_model.rank = s.rank.to_view_model();
          seat_model.player = s.rank.player.to_view_model();

          console.log(seat_model);

          this.model.seats[seat_model.seat.position] = seat_model;
        });

        this.model.num_seats = this.table.seats.count();
        this.rebind_events();
      })
      .catch((err) => console.log(err));
  }

  onDropPlayerClicked(el) {
    let position = $(el.currentTarget).data('idx');

    let seat_vm = this.model.seats[position].seat;
    let rank_vm = this.model.seats[position].rank;

    rank_vm.dropped = !rank_vm.dropped;

    let seat = this.table.seats.get_by_id(seat_vm._id);

    seat.rank.from_view_model(rank_vm);

    seat.rank.save();
  }

  onRecordScoresClicked(el) {
    console.log("Record Scores Clicked");

    for(let item of this.model.seats) {
      if(!item)
        continue;

      let seat = this.table.seats.get_by_id(item.seat._id);

      console.log(item.seat);

      // score is saved on seat
      // at the end of the round, this is added to player rank's score.
      seat.set('score', parseInt(item.seat.score));
      seat.save().then( () => {
        console.log("After Save");
        console.log(seat);
      });
    }
  }
}
