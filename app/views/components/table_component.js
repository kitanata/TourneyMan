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
      'can_move_player': false,
      'can_edit': false,
      'table': {},
      'seats': [],
      'num_seats': 0,
      'round_started': false,
    }

    this.events = {
      "click": {
        ".record_scores": (el) => this.onRecordScoresClicked(el),
        ".drop_player": (el) => this.onDropPlayerClicked(el),
        ".ban_player": (el) => this.onRemovePlayerClicked(el),
        ".unseat_player": (el) => this.onUnseatPlayerClicked(el),
        ".move_player": (el) => this.onMovePlayerClicked(el),
        ".mark_win": (el) => this.onMarkWinClicked(el),
        ".unmark_win": (el) => this.onUnmarkWinClicked(el),
        ".edit_table": () => this.onEditTableClicked(),
        ".delete_table": () => this.onRemoveTableClicked()
      }
    }
  }

  async pre_render() {
    console.log("TableComponent::pre_render()");

    this.model.is_superuser = user.is_superuser();

    this.table = new Table();

    console.log("Fetching table");
    await this.table.fetch_by_id(this.table_id);

    this.model.table = this.table.to_view_model();
    await this.table.fetch_related();

    this.model.round_started = this.table.round.get('started');

    let round_finished = this.table.round.get('finished');

    this.model.can_modify = user.is_superuser();
    if(this.table.event.get('organizer_id') === user.get_id())
      this.model.can_modify = true;

    if(!round_finished) {
      this.model.can_edit = this.model.can_modify;
      this.model.can_move_player = this.model.can_modify;
    } 

    await this.table.seats.fetch_related();

    await this.table.seats.each( (s) => {
      await s.rank.fetch_related();
    });

    this.model.seats = [];
    this.model.num_seats = this.table.seats.count();

    let seat_count = this.model.num_seats;

    if(seat_count > 4)
      seat_count = 4;

    for(let s of this.table.seats.models) {
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
    }
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

  async onRemovePlayerClicked(el) {
    let position = $(el.currentTarget).data('idx');
    let index = this.__get_position_index(position);

    let seat_vm = this.model.seats[index].seat;
    let seat = this.table.seats.get_by_id(seat_vm._id);

    window.router.open_dialog("confirm_action", 
      "Are you sure you want to ban this player from the ENTIRE event?",
      () => {
        this.table.remove_related_from_set('seats', seat);

        let new_pos = 1;
        await this.table.seats.each( (s) => {
          s.set('position', new_pos);
          s.save();
          new_pos += 1;
        });
        
        await this.table.save();
        this.render();
      });
  }
  
  async onUnseatPlayerClicked(el) {
    let position = $(el.currentTarget).data('idx');
    let index = this.__get_position_index(position);
    let seat_vm = this.model.seats[index].seat;

    window.router.open_dialog("confirm_action", 
      "Are you sure you want to unseat this player from this table?",
      () => {
        let seat = new Seat();

        await seat.fetch_by_id(seat_vm._id);

        this.table.remove_related_from_set('seats', seat);
        this.model.seats.splice(index, 1);
        this.model.num_seats = this.model.num_seats - 1;
        await this.table.save();

        let x = 1;

        await this.table.seats.each( (s) => {
          s.set('position', x);
          x += 1;
          await s.save();
        });

        await seat.destroy();

        this.render();
        this.messenger.publish('unseat_player', {});
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

  onEditTableClicked() {
    console.log("TableComponentView::onEditTableClicked called");
    this.model.can_edit = !this.model.can_edit;
    this.update();
  }

  async onRemoveTableClicked() {
    console.log("TableComponentView::onRemoveTableClicked called");

    router.open_dialog("delete_model", () => {
      this.table.round.remove_related_from_set('tables', this.table);

      await this.table.round.save();
      await this.table.destroy();
      this.messenger.publish('table_deleted', {});
    });
  }

  async onRecordScoresClicked(el) {
    console.log("Record Scores Clicked");

    for(let item of this.model.seats) {
      if(!item)
        continue;

      let seat = this.table.seats.get_by_id(item.seat._id);

      console.log(item.seat);

      // score is saved on seat
      // at the end of the round, this is added to player rank's score.
      seat.set('score', parseInt(item.seat.score));
      await seat.save();
      console.log("After Save");
      console.log(seat);
    }
  }

  __get_position_index(position) {
    let pos_idx = parseInt(position) - 1;

    if(pos_idx < 0)
      console.log("WARN: Player position < 1. This shouldn't happen.");

    return pos_idx;
  }
}

