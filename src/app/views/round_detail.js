'use strict';

import BaseView from '../framework/base_view';
import Global from '../framework/global';

export default class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.title = "Round Details";
    this.template = "round-detail";

    this.model = {
      'is_superuser': false,
      'can_modify': false,
      'can_seat': false,
      'should_show_start_round': false,
      'should_show_finish_round': false,
      'should_show_create_table': false,
      'should_show_seat_players': false,
      'should_show_print_score_sheets': false,
      'should_show_generate_scores': false,
      'event': {},
      'round': {},
      'unseated': [],
    };

    this.round = new Round();
    this.round_id = round_id;

    this.table_views = [];

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          Global.instance().user = null;
          router.navigate("login");
        },
        ".print-score-sheets": () => this.onPrintScoreSheetsClicked(),
        ".seat-players": () => this.onSeatPlayersClicked(),
        ".seat-player": (el) => this.onSeatPlayerClicked(el),
        ".create-table": () => this.onCreateTableClicked(),
        ".start-round": () => this.onStartRoundClicked(),
        ".finish-round": () => this.onFinishRoundClicked(),
        ".generate-random-scores": (el) => this.onRandomScoresClicked(el),
        ".on-close": () => router.navigate("back")
      }
    }
  }

  async pre_render() {
    router.menu_view.set_active_menu('events');

    this.messenger.unsubscribe(this);

    this.messenger.subscribe('move_player', (options) => {
      this.onMovePlayerTriggered(options);
    }, this);

    this.messenger.subscribe('seat_player', (options) => {
      this.onSeatPlayerTriggered(options);
    }, this);

    this.messenger.subscribe('unseat_player', (options) => {
      this.onUnseatPlayerTriggered(options);
    }, this);

    this.messenger.subscribe('table_deleted', (options) => {
      this.onTableDeletedTriggered(options);
    }, this);

    await this.round.fetch_by_id(this.round_id);
    this.model.round = this.round.to_view_model();

    await this.round.fetch_related();
    this.model.event = this.round.event.to_view_model();
    this.model.is_superuser = user.is_superuser();
    this.model.can_modify = user.is_superuser();

    if(this.round.event.get('started')) {
      this.model.can_seat = this.model.can_modify;

      if(this.round.get('seated')) {
        this.model.should_show_print_score_sheets = true;
        this.model.should_show_create_table = true;

        if(user.get('developer')) {
          this.model.should_show_generate_scores = true;
        }

        if(!this.round.get('started')) {
          this.model.should_show_start_round = true;
        } else if(!this.round.get('finished')) {
          this.model.should_show_finish_round = true;
        }
      } else {
        this.model.should_show_seat_players = true;
      }
    }

    await this.round.event.fetch_related();
    this.ranks = this.round.event.ranks.filter( (r) => !r.get('dropped'));

    if(this.round.event.get('organizer_id') === user.get_id())
      this.model.can_modify = true;

    for(let r of this.ranks.models) {
      await r.fetch_related();
    }

    await this.round.tables.fetch_related();

    this.update_unseated();
    this.rebind_events();
    await this.build_child_views();
  }

  update_unseated() {
    let tables = this.round.tables.models;
    let seated_ranks = [];
    for(let t of tables) {
      let seats = t.seats.models;
      for(let s of seats) {
        seated_ranks.push(s.get('rank_id'));
      }
    }

    this.model.unseated = [];
    for(let rank of this.ranks.models) {
      if(!_.includes(seated_ranks, rank.get_id())) {
        this.model.unseated.push({
          name: rank.player.get('name'),
          id: rank.get_id()
        });
      }
    }
  }

  build_child_views() {
    this.table_views = [];

    for(let t of this.round.tables.models) {
      let table_comp = new TableComponentView(t.get_id());

      table_comp.render(this.get_element().find('.tables'));

      this.table_views.push(table_comp);
    }
  }

  render_children() {
    this.get_element().find('.tables').empty();

    for(let tv of this.table_views) {
      tv.render(this.get_element().find('.tables'));
    }
  }

  async onStartRoundClicked() {
    console.log("onStartRoundClicked");
    if(!this.model.can_modify) return; //perm guard

    const service = new RoundService();
    service.start_round(round);

    this.model.round = this.round.to_view_model();
    this.model.should_show_start_round = false;
    this.model.should_show_seat_players = false;
    this.model.should_show_finish_round = true;
    this.model.can_seat = this.model.can_modify;

    if(user.get('developer')) {
      this.model.should_show_generate_scores = true;
    }

    this.render_children();
  }

  async onFinishRoundClicked() {
    console.log("onFinishRoundClicked");
    if(!this.model.can_modify) return; //perm guard

    const service = new RoundService();
    await service.finish_round(round);

    this.model.round = this.round.to_view_model();

    this.model.should_show_seat_players = false;
    this.model.should_show_finish_round = false;
    this.model.should_show_start_round = false;
    this.model.should_show_generate_scores = false;

    this.render_children();
  }

  onMovePlayerTriggered(options) {
    console.log("onMovePlayerTriggered");

    router.open_dialog('move_player', options.seat_id);
    router.active_dialog.onClose = () => {
      this.update_unseated();
      this.render_children();
    }
  }

  onSeatPlayerTriggered(options) {
    console.log("onSeatPlayerTriggered");

    router.open_dialog('seat_player', options.rank_id, options.round);
    router.active_dialog.onClose = () => {
      this.update_unseated();
      this.render_children();
    }
  }

  onUnseatPlayerTriggered(options) {
    console.log("onUnseatPlayerTriggered");

    this.render();
    //this.update_unseated();
    //this.render_children();
  }

  async onTableDeletedTriggered(options) {
    console.log("onTableDeletedTriggered");

    await this.round.update();
    await this.round.fetch_related_set('tables');
    await this.round.tables.fetch_related();
    await this.build_child_views();

    this.update_unseated();
    this.render_children();
  }
  
  onPrintScoreSheetsClicked() {
    console.log("onPrintScoreSheetsClicked");

    router.open_dialog('print_score_sheets', this.round.get_id());
  }

  onSeatPlayerClicked(el) {
    console.log("onSeatPlayerClicked");

    let rank_id = $(el.currentTarget).data('id');

    this.messenger.publish('seat_player', {
      'rank_id': rank_id,
      'round': this.round,
    });
  }

  async onCreateTableClicked(el) {
    console.log("onCreateTableClicked");

    router.open_dialog("single_input_dialog", "Name your new table",
      "text", "Create Table", async (table_name) => {

        let new_table = new Table();
        new_table.create();
        new_table.set('name', table_name);
        new_table.round = this.round;
        new_table.event = this.round.event;
        new_table.seats = new Seats();
        this.round.add_related_to_set('tables', new_table);

        await new_table.save();
        await this.build_child_views();
        this.render_children();
    });
  }

  async onSeatPlayersClicked() {
    console.log("onSeatPlayersClicked");

    if(!this.model.can_modify) return; //perm guard

    let num_players = this.round.event.ranks.count_where( (r) => !r.get('dropped'));

    const table_service = new TableService();
    const seating_service = new SeatingService();

    const tables = table_service.generate_tables(round, num_players);
    table_service.assign_tables_to_round(tables, this.round);

    seatingService.seat_players(tables, this.round.event.ranks);

    this.round.set("seated", true);
    await this.round.save();

    this.model.round = this.round.to_view_model();
    this.model.should_show_start_round = true;
    this.model.should_show_seat_players = false;

    this.update_unseated();

    await this.build_child_views();
    this.render_children();
  }

  async onRandomScoresClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    const service = new RoundService();
    service.randomize_scores(this.round);

    this.render_children();
  }

  onReseatPlayersClicked(el) {
    console.log("Reseat the players");
  }

}
