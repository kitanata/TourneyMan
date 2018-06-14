'use strict';

import $ from 'jquery';
import _ from 'lodash';
import validate from 'validate.js';

import BaseView from '../framework/base_view';
import Global from '../framework/global';
import logger from '../framework/logger';

import { User } from '../models/user';
import { Event, Events } from '../models/event';

import EventService from '../services/event_service';

export default class UserProfileView extends BaseView {

  constructor(user_id) {
    super();

    this.title = "User Profile";
    this.template = "user-profile";

    this.user_id = user_id || null;
    this.user = new User();

    this.open_events = null;
    this.registered_events = null;

    this.model = {
      is_superuser: Global.instance().user.is_superuser(),
      can_modify: false,
      can_promote: false,
      can_demote: false,
      user: {},
      event_search: "",
      password: "",
      confirm: "",
      open_events: [],
      registered_events: [],
      errors: []
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".logout": () => {
          Global.instance().user = null;
          router.navigate("login");
        },
        "#on-submit": (el) => this.on_submit(el),
        ".promote": () => this.onPromoteClicked(),
        ".demote": () => this.onDemoteClicked(),
        ".enable-developer-mode": () => this.onEnableDeveloperModeClicked(),
        ".disable-developer-mode": () => this.onDisableDeveloperModeClicked(),
        ".change-password": () => this.onChangePasswordClicked(),
        ".event-register": (el) => this.onEventRegisterClicked(el),
        ".event-unregister": (el) => this.onEventUnregisterClicked(el),
      }
    }

    this.form_constraints = {
      name: {
        presence: true,
      },
      email: {
        presence: true,
        email: true,
      },
      phone_number: {
        presence: true,
      },
      address: {
        presence: true,
      },
      city: {
        presence: true,
      },
      state: {
        presence: true,
      },
      zip_code: {
        presence: true,
        length: {
          is: 5
        },
        format: /\d{5}(-\d{4})?/
      }
    }

    this.change_password_form_constraints = {
      password: {
        presence: true,
        length: {
          minimum: 8,
        },
        equality: "confirm"
      },
      confirm: {
        presence: true,
        equality: "password"
      }
    }
  }

  async pre_render() {
    logger.info("User Profile Pre Render");
    router.menu_view.set_active_menu('profile');

    this.open_events = new Events();

    const global = Global.instance();

    if(this.user_id) {
      await this.user.fetch_by_id(this.user_id);
      this.model.user = this.user.to_view_model();

      this.model.can_modify = (this.user.get_id() === global.user.get_id());

      if(global.user.is_superuser()) {
        this.model.can_modify = true;

        if(!this.user.is_superuser())
          this.model.can_promote = (this.user.get_id() != global.user.get_id());
        else
          this.model.can_demote = (this.user.get_id() != global.user.get_id());
      }

      if(global.user.is_global_superuser()) {
        if(this.user.is_developer())
          this.model.can_disable_developer_mode = true;
        else
          this.model.can_enable_developer_mode = true;
      }

      if(this.user.is_global_superuser()) {
        this.model.can_promote = false;
        this.model.can_demote = false;
      }

      this.update();
    }

    await this._update_event_lists();

  }

  async _update_event_lists() {
    await this.open_events.fetch_where({
      'published': true,
      'started': false
    });
    let result = await this.user.fetch_related();
    this.registered_events = this.user.events;
    this.open_events = this.difference(this.open_events, this.registered_events);

    this.model.open_events = this.open_events.to_view_models();
    this.model.registered_events = this.user.events.to_view_models();
  }

  post_render() { }

  async on_submit(el) {
    let errors = validate(this.model.user, this.form_constraints);

    if(errors) {
      this.model.errors = errors;
      this.render();
    } else {
      this.user.from_view_model(this.model.user);

      logger.debug(this.user);
      await this.user.save();
      router.navigate('back');
    }
  }

  async onPromoteClicked() {
    logger.info("onPromoteClicked Called");

    if(!Global.instance().user.is_superuser())
      return;

    this.user.promote();

    await this.user.save();
    this.model.user = this.user.to_view_model();
    this.model.can_promote = false;
    this.model.can_demote = true;
    this.update();
    router.menu_view.render();
  }

  async onEnableDeveloperModeClicked() {
    logger.info("onEnableDeveloperModeClicked");

    if(!Global.instance().user.is_global_superuser())
      return;

    await this.user.update();

    this.user.enable_developer_mode();

    await this.user.save();
    this.model.user = this.user.to_view_model();
    this.model.can_enable_developer_mode = false;
    this.model.can_disable_developer_mode = true;
    this.update();
    router.menu_view.render();
  }

  async onDisableDeveloperModeClicked() {
    logger.info("onDisableDeveloperModeClicked");

    if(!Global.instance().user.is_global_superuser())
      return;

    await this.user.update();

    this.user.disable_developer_mode();

    await this.user.save();
    this.model.user = this.user.to_view_model();
    this.model.can_enable_developer_mode = true;
    this.model.can_disable_developer_mode = false;
    this.update();
    router.menu_view.render();
  }

  async onDemoteClicked() {
    logger.info("onDemoteClicked Called");

    if(!Global.instance().user.is_superuser())
      return;

    this.user.demote();

    await this.user.save();
    this.model.user = this.user.to_view_model();
    this.model.can_promote = true;
    this.model.can_demote = false;
    this.update();
    router.menu_view.render();
  }

  async onChangePasswordClicked() {
    let errors = validate({ 
      password: this.model.password, 
      confirm: this.model.confirm
    }, this.change_password_form_constraints);

    if(errors) {
      this.model.errors = errors;
    } else {
      await this.user.set_password(this.model.password);
      this.model.password = "";
      this.model.confirm = "";

      router.open_dialog('password_changed');
    }
  }

  async onEventRegisterClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    let event = new Event();
    let ev_service = new EventService();

    await event.fetch_by_id(event_id);
    await event.fetch_related();

    if(ev_service.is_player_registered(event, this.user)) {
      logger.error("Player is already registered for the event.");
      return;
    }

    ev_service.register_player(event, this.user);

    if(event.tournament !== null) {
      await event.tournament.register_player(this.user);
    }

    this._update_event_lists();

    this.render();
    this.rebind_events();
  }

  async onEventUnregisterClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    let event = new Event();
    let ev_service = new EventService();

    await event.fetch_by_id(event_id);
    await event.fetch_related();
    await ev_service.remove_player(event, this.user);

    if(event.tournament !== null) {
      await event.tournament.remove_player(this.user);
    }

    this._update_event_lists();

    this.render();
    this.rebind_events();
  }

  // Set difference between two collections
  difference(first, second) {
    let second_ids = _.map(second.models, (x) => x.get_id());

    let diff_event_models = _.filter(first.models, (x) => {
      return !_.includes(second_ids, x.get_id());
    });

    return new Events(diff_event_models);
  }
}
