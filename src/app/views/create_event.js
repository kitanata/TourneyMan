'use strict';

import validate from 'validate.js';

import BaseView from '../framework/base_view';
import Global from '../framework/global';

import { Event } from '../models/event';

export default class CreateEventView extends BaseView {

  constructor(event_id) {
    super();

    this.title = "Create Event";
    this.template = "create-event";

    this.model = {
      event: {},
      errors: []
    }

    this.event_id = event_id || -1;
    this.event = null;

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
        "#on-submit": (el) => this.on_submit(el),
        ".on-close": () => {
          router.navigate("back");
        }
      }
    }

    this.form_constraints = {
      event_name: {
        presence: true,
      }
    }
  }

  async pre_render() {
    router.menu_view.set_active_menu('events');

    this.event = new Event();

    if(this.event_id == -1) {
      this.event.create();

      this.model.event = this.event.to_view_model();
      return;
    } 

    await this.event.fetch_by_id(this.event_id);
    this.model.event = this.event.to_view_model();
  }

  async on_submit(el) {
    let errors = validate(this.model.event, this.form_constraints);

    if(errors) {
      this.model.errors = errors;
      return;
    }

    const user = Global.instance().user;

    this.event.from_view_model(this.model.event);
    this.event.organizer = user;


    await this.event.save();
    user.add_related_to_set('organized_events', this.event);

    await user.save();
    router.navigate('back');
  }
}
