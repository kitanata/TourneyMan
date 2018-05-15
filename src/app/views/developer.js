'use strict';

import $ from 'jquery';

import BaseView from '../framework/base_view';

import { User, Users } from '../models/user';
import { Event, Events } from '../models/event';
import { EventTemplate, EventTemplates } from '../models/event_template';
import { Tournaments } from '../models/tournament';
import { TournamentTemplate, TournamentTemplates } from '../models/tournament_template';
import { Rounds } from '../models/round';
import { Ranks } from '../models/rank';
import { Seats } from '../models/seat';
import { Tables } from '../models/table';

import EventService from '../services/event_service';

export default class DeveloperView extends BaseView {

  constructor() {
    super();

    this.title = "Developer Menu";
    this.template = "developer";

    this.user_set = null;
    this.event_set = null;
    this.event_template_set = null;
    this.tournament_set = null;
    this.tournament_template_set = null;
    this.round_set = null;
    this.rank_set = null;
    this.seat_set = null;
    this.table_set = null;

    this.model = {
      db_counts: [],
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron,
      download_link: "",
      download_ready: false
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".user_list": () => router.navigate("list_users"),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        ".on-close": () => {
          router.navigate("back");
        },
        ".drop-db": (el) => this.onDropDatabaseClicked(el),
        ".clear_database": (el) => this.onClearDatabaseClicked(el),
        ".generate_data": (el) => this.onGenDataClicked(el),
        ".bootstrap": (el) => this.onBootstrapClicked(el),
        ".export-json": (el) => this.onExportDataClicked(el),
      }
    }
  }

  async pre_render() {
    if(!window.user.is_developer()) return;

    router.menu_view.set_active_menu('admin');

    this.user_set = new Users();
    this.event_set = new Events();
    this.event_template_set = new EventTemplates();
    this.tournament_set = new Tournaments();
    this.tournament_template_set = new TournamentTemplates();
    this.round_set = new Rounds();
    this.rank_set = new Ranks();
    this.seat_set = new Seats();
    this.table_set = new Tables();

    await this.user_set.all();
    await this.event_set.all();
    await this.event_template_set.all();
    await this.tournament_set.all();
    await this.tournament_template_set.all();
    await this.round_set.all();
    await this.rank_set.all();
    await this.seat_set.all();
    await this.table_set.all();

    this.update_model();
    this.rebind_events();
  }

  update_model() {
    this.model.dbs = [
      {
        'name': 'Users',
        'set_name': 'user_set',
        'count': this.user_set.count()
      }, {
        'name': 'Events',
        'set_name': 'event_set',
        'count': this.event_set.count()
      }, {
        'name': 'EventTemplates',
        'set_name': 'event_template_set',
        'count': this.event_template_set.count()
      }, {
        'name': 'Tournaments',
        'set_name': 'tournament_set',
        'count': this.tournament_set.count()
      }, {
        'name': 'TournamentTemplates',
        'set_name': 'tournament_template_set',
        'count': this.tournament_template_set.count()
      }, {
        'name': 'Rounds',
        'set_name': 'round_set',
        'count': this.round_set.count()
      }, {
        'name': 'Ranks',
        'set_name': 'rank_set',
        'count': this.rank_set.count()
      }, {
        'name': 'Seats',
        'set_name': 'seat_set',
        'count': this.seat_set.count()
      }, {
        'name': 'Tables',
        'set_name': 'table_set',
        'count': this.table_set.count()
      }
    ];
  }

  async onDropDatabaseClicked(el) {
    if(!window.user.is_developer()) return;

    let set_name = $(el.currentTarget).data('id');

    await this[set_name].destroy();
    this.update_model();
    this.rebind_events();
  }

  async onGenDataClicked(el) {
    if(!window.user.is_developer()) return;

    console.log("Generating Users");
    for(let i=0; i < this.model.num_users; i++) {
      let new_user = new User();
      new_user.randomize(); //saves them by using register function.
    }

    console.log("Generating Events");
    for(let i=0; i < this.model.num_events; i++) {
      let new_event = new Event();
      new_event.randomize();
      new_event.save();
    }

    let events = new Events();
    let users = new Users();

    await events.all();
    await users.all();

    for(let e of events.models) {
      await e.fetch_related();
    }

    console.log("Generating Players");
    for(let i=0; i < this.model.num_players; i++) {
      await this.generate_player(users, events);
    }

    console.log("Finished Creating Players!");
  }

  async generate_player(users, events) {
    var user = chance.pickone(users.models);
    var event = chance.pickone(events.models);

    const ev_service = new EventService();

    await ev_service.register_player(event, user);
    return event.tournament.register_player(user);
  }

  async onBootstrapClicked(el) {
    let local_qualifier = new EventTemplate()
    let finals = new EventTemplate()

    local_qualifier.create()
    local_qualifier.organizer = user;

    local_qualifier.from_view_model({
      'event_name': "Catan Local Qualifier Event",
      'game_name': "Catan",
      'buy_player_score_by_average': true,
      'round_names': ["Round 1", "Round 2", "Round 3"]
    });

    finals.create()
    finals.organizer = user;
    finals.from_view_model({
      'event_name': "Catan Finals Event",
      'game_name': "Catan",
      'buy_player_score_by_average': true,
      'round_names': ["Round 1", "Round 2", "Round 3"]
    });

    await local_qualifier.save();
    await finals.save()

    window.user.add_related_to_set('event_templates', local_qualifier);
    window.user.add_related_to_set('event_templates', finals);
    await window.user.save();

    let catan = new TournamentTemplate()
    catan.create()
    catan.organizer = user;
    catan.from_view_model({
      'name': "Catan Tournament",
      'event_templates': [{
        'event_template_name': local_qualifier.get('event_name'),
        'event_template_id': local_qualifier.get_id(),
        'previous_event_ids': [],
        'next_event_id': finals.get_id()
      }, {
        'event_template_name': finals.get('event_name'),
        'event_template_id': finals.get_id(),
        'previous_event_ids': [local_qualifier.get_id()],
        'next_event_id': null,
      }]
    });

    await catan.save()
    alert("DONE!");
  }

  onExportDataClicked(el) {
    let export_data = {}

    for(let model_set of this.model.dbs) {
      export_data[model_set['name']] = this[model_set['set_name']].to_view_models();
    }

    let data = "text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(export_data));

    this.model.download_link = "data:" + data;
    this.model.download_ready = true;
  }
}
