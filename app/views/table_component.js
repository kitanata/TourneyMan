'use strict';

class TableComponentView extends BaseView {

  constructor(table_id) {
    super();

    this.title = "Table";
    this.template = "table-component";

    this.table = null;
    this.table_id = table_id;

    this.seat_svg_data = {
      1: [{
        points: "0,0 100,0 100,100 0,100",
        name_text_x: 50,
        name_text_y: 55,
        name_text_transform: "rotate(0)",
        pos_text_x: 50,
        pos_text_y: 45,
        position: 1
      }],

      2: [{
        points: "0,0 100,0 100,50 0,50",
        name_text_x: 50,
        name_text_y: 35,
        name_text_transform: "rotate(0)",
        pos_text_x: 50,
        pos_text_y: 25,
        position: 1
      },{
        points: "0,50 100,50 100,100 0,100",
        name_text_x: 50,
        name_text_y: 85,
        name_text_transform: "rotate(0)",
        pos_text_x: 50,
        pos_text_y: 75,
        position: 2
      }],

      3: [{
        points: "0,0 50,0 50,50 0,100",
        name_text_x: 25,
        name_text_y: 40,
        name_text_transform: "rotate(0)",
        pos_text_x: 25,
        pos_text_y: 30,
        position: 1
      },{
        points: "100,0 50,0 50,50 100,100",
        name_text_x: 75,
        name_text_y: 40,
        name_text_transform: "rotate(0)",
        pos_text_x: 75,
        pos_text_y: 30,
        position: 2
      },{
        points: "0,100 50,50 100,100",
        name_text_x: 50,
        name_text_y: 90,
        name_text_transform: "rotate(0)",
        pos_text_x: 50,
        pos_text_y: 80,
        position: 3
      }],

      4: [{
        points: "0,0 50,50 100,0",
        name_text_x: 50,
        name_text_y: 10,
        name_text_transform: "rotate(0)",
        pos_text_x: 50,
        pos_text_y: 45,
        position: 1 
      },{
        points: "100,0 50,50 100,100",
        name_text_x: 50,
        name_text_y: -90,
        name_text_transform: "rotate(90)",
        pos_text_x: 60,
        pos_text_y: 55,
        position: 2
      },{
        points: "0,100 50,50 100,100",
        name_text_x: 50,
        name_text_y: 90,
        name_text_transform: "rotate(0)",
        pos_text_x: 50,
        pos_text_y: 65,
        position: 3
      },{
        points: "0,0 50,50 0,100",
        name_text_x: -50,
        name_text_y: 10,
        name_text_transform: "rotate(-90)",
        pos_text_x: 40,
        pos_text_y: 55,
        position: 4
      }]
    }

    this.model = {
      'is_superuser': false,
      'can_modify': false,
      'table': {},
      'seats': [],
      'num_seats': 0,
      'round_started': false,
      'can_record_scores': false
    }

    this.events = {
      "click": {
        ".record-scores": (el) => this.onRecordScoresClicked(el),
        ".drop-player": (el) => this.onDropPlayerClicked(el),
        ".remove-player": (el) => this.onRemovePlayerClicked(el),
        ".move-player": (el) => this.onMovePlayerClicked(el),
        ".mark-win": (el) => this.onMarkWinClicked(el),
        ".unmark-win": (el) => this.onUnmarkWinClicked(el),
      }
    }
  }

  pre_render() {
    console.log("TableComponent::pre_render()");

    this.model.is_superuser = user.is_superuser();

    this.table = new Table();

    console.log("Fetching table");
    return this.table.fetch_by_id(this.table_id)
      .then( () => {
        this.model.table = this.table.to_view_model();
        return this.table.fetch_related();
      })
      .then( () => {
        this.model.round_started = this.table.round.get('started');

        let round_finished = this.table.round.get('finished');

        this.model.can_modify = user.is_superuser();
        if(this.table.event.get('organizer_id') === user.get_id())
          this.model.can_modify = true;

        this.model.can_record_scores = this.model.can_modify && !round_finished;

        return this.table.seats.fetch_related();
      })
      .then( () => {
        return this.table.seats.each( (s) => {
          return s.rank.fetch_related();
        });
      })
      .then( () => {
        this.model.seats = [];
        this.model.num_seats = this.table.seats.count();

        let seat_count = this.model.num_seats;

        if(seat_count > 4)
          seat_count = 4;

        return this.table.seats.each( (s) => {
          let seat_model = {};

          let position = s.get('position');
          let index = this.__get_position_index(position);

          //flatten it
          seat_model.seat = s.to_view_model();
          seat_model.rank = s.rank.to_view_model();
          seat_model.player = s.rank.player.to_view_model();
          seat_model.position = position;
          seat_model.svg = this.seat_svg_data[seat_count][index];

          this.model.seats.push(seat_model);
        });
      })
      .catch((err) => console.log(err));
  }

  onDropPlayerClicked(el) {
    let position = $(el.currentTarget).data('idx');
    let index = this.__get_position_index(position);

    let seat_vm = this.model.seats[index].seat;
    let rank_vm = this.model.seats[index].rank;

    rank_vm.dropped = !rank_vm.dropped;

    let seat = this.table.seats.get_by_id(seat_vm._id);

    seat.rank.from_view_model(rank_vm);

    seat.rank.save();
  }

  onRemovePlayerClicked(el) {
    let position = $(el.currentTarget).data('idx');
    let index = this.__get_position_index(position);

    let seat_vm = this.model.seats[index].seat;
    let seat = this.table.seats.get_by_id(seat_vm._id);

    this.table.remove_related_from_set('seats', seat);

    let new_pos = 1;
    return this.table.seats.each( (s) => {
      s.set('position', new_pos);
      s.save();
      new_pos += 1;
    }).then( () => {
      return this.table.save();
    }).then( () => {
      this.render();
    });
  }

  onMovePlayerClicked(el) {
    let position = $(el.currentTarget).data('idx');
    let index = this.__get_position_index(position);
    let seat_vm = this.model.seats[index].seat;

    this.messenger.publish('move_player', {
      'seat_id': seat_vm._id
    });
  }

  onMarkWinClicked(el) {
    let position = $(el.currentTarget).data('idx');

    for(let s of this.model.seats) {
      if(s.seat.position == position) {
        s.seat.won = true;
      } else {
        s.seat.won = false;
      }

      let seat = this.table.seats.get_by_id(s.seat._id);
      seat.from_view_model(s.seat);
      seat.save();
    }
  }

  onUnmarkWinClicked(el) {
    let position = $(el.currentTarget).data('idx');
    let index = this.__get_position_index(position);

    let seat_vm = this.model.seats[index].seat;
    let seat = this.table.seats.get_by_id(seat_vm._id);

    seat_vm.won = false;
    seat.from_view_model(seat_vm);
    seat.save();
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

  __get_position_index(position) {
    let pos_idx = parseInt(position) - 1;

    if(pos_idx < 0)
      console.log("WARN: Player position < 1. This shouldn't happen.");

    return pos_idx;
  }
}

