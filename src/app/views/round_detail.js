'use strict';

import $ from 'jquery';

import BaseView from '../framework/base_view';
import Global from '../framework/global';
import logger from '../framework/logger';

import { Round } from '../models/round';

import TableService from '../services/table_service';
import SeatingService from '../services/seating_service';
import RoundService from '../services/round_service';

import SeatingServiceConfig from '../services/seating/seating_service_config';
import SeatingServiceStats from '../services/seating/seating_service_stats';

import TableComponentView from './components/table_component';

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

    const user = Global.instance().user;

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
        } else {
          this.model.should_show_create_table = false;
          this.model.should_show_print_score_sheets = false;
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

    const unseated_players = []

    for(let rank of this.ranks.models) {
      if(!_.includes(seated_ranks, rank.get_id())) {
        unseated_players.push({
          name: rank.player.get('name'),
          id: rank.get_id()
        });
      }
    }

    this.model.unseated = _.sortBy(unseated_players, (up) => up.name);
  }

  build_child_views() {
    this.table_views = [];

    for(let t of this.round.tables.models) {
      let table_comp = new TableComponentView(t.get_id());

      table_comp.render(this.get_element().find('.tables'));

      this.table_views.push(table_comp);
    }
  }

  async render_children() {
    this.get_element().find('.tables').empty();

    for(let tv of this.table_views) {
      await tv.render(this.get_element().find('.tables'));
    }
  }

  async onStartRoundClicked() {
    logger.info("onStartRoundClicked");
    if(!this.model.can_modify) return; //perm guard

    const service = new RoundService();
    service.start_round(this.round);

    this.model.round = this.round.to_view_model();
    this.model.should_show_start_round = false;
    this.model.should_show_seat_players = false;
    this.model.should_show_print_score_sheets = true;
    this.model.should_show_finish_round = true;
    this.model.can_seat = this.model.can_modify;

    if(Global.instance().user.get('developer')) {
      this.model.should_show_generate_scores = true;
    }

    return this.render_children();
  }

  async onFinishRoundClicked() {
    logger.info("onFinishRoundClicked");
    if(!this.model.can_modify) return; //perm guard

    const service = new RoundService();
    await service.finish_round(this.round);

    this.model.round = this.round.to_view_model();

    this.model.should_show_seat_players = false;
    this.model.should_show_finish_round = false;
    this.model.should_show_start_round = false;
    this.model.should_show_generate_scores = false;
    this.model.should_show_print_score_sheets = false;

    this.render_children();
  }

  onMovePlayerTriggered(options) {
    logger.info("onMovePlayerTriggered");

    router.open_dialog('move_player', options.seat_id);
    router.active_dialog.onClose = async () => {
      this.update_unseated();
      return this.render_children();
    }
  }

  onSeatPlayerTriggered(options) {
    logger.info("onSeatPlayerTriggered");

    router.open_dialog('seat_player', options.rank_id, options.round);
    router.active_dialog.onClose = async () => {
      this.update_unseated();
      return this.render_children();
    }
  }

  onUnseatPlayerTriggered(options) {
    logger.info("onUnseatPlayerTriggered");

    this.render();
    //this.update_unseated();
    //this.render_children();
  }

  async onTableDeletedTriggered(options) {
    logger.info("onTableDeletedTriggered");

    await this.round.update();
    await this.round.fetch_related_set('tables');
    await this.round.tables.fetch_related();
    await this.build_child_views();

    this.update_unseated();
    return this.render_children();
  }
  
  onPrintScoreSheetsClicked() {
    logger.info("onPrintScoreSheetsClicked");

    router.open_dialog('print_score_sheets', this.round.get_id());
  }

  onSeatPlayerClicked(el) {
    logger.info("onSeatPlayerClicked");

    let rank_id = $(el.currentTarget).data('id');

    this.messenger.publish('seat_player', {
      'rank_id': rank_id,
      'round': this.round,
    });
  }

  async onCreateTableClicked(el) {
    logger.info("onCreateTableClicked");

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
        return this.render_children();
    });
  }

  async onSeatPlayersClicked() {
    logger.info("onSeatPlayersClicked");

    if(!this.model.can_modify) return; //perm guard

    const table_service = new TableService();

    const valid_players = this.round.event.ranks.filter( (r) => !r.get('dropped'));

    const config = new SeatingServiceConfig(valid_players.length);
    const stats = new SeatingServiceStats();
    const seating_service = new SeatingService(config, stats);

    const do_work = async () => {
      const table_arrangement = seating_service.seat_players(valid_players).get_arrangement();
      const tables = await table_service.generate_tables_from_arrangement(table_arrangement);

      await table_service.assign_tables_to_round(tables, this.round);

      this.round.set("seated", true);
      return this.round.save();
    };

    router.open_dialog(
      'progress_dialog',
      "Seating the players. This may take awhile...",
      do_work, async () => {
        this.model.round = this.round.to_view_model();
        this.model.should_show_start_round = true;
        this.model.should_show_seat_players = false;

        this.update_unseated();

        await this.build_child_views();
        return this.render_children();
      }
    );
  }

  async onRandomScoresClicked(el) {
    if(!this.model.can_modify) return; //perm guard

    const service = new RoundService();
    await service.randomize_scores(this.round);

    await this.render_children();
  }

  onReseatPlayersClicked(el) {
    logger.info("Reseat the players");
  }

}
