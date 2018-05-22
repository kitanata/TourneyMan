'use strict';

import BaseView from '../framework/base_view';
import Global from '../framework/global';

export default class MainMenuView extends BaseView {

  constructor() {
    super();

    this.template = "main-menu-template";
    this.container = "main-menu";

    this.events = {
      "click": {
        ".tournament_list": () => router.navigate("tournament_list"),
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".template_list": () => router.navigate("template_list"),
        ".open_developer": () => router.navigate("developer"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          Global.instance().user = null;
          router.navigate("login");
        }
      }
    }

    this.model = {
      'is_loggedin': false,
      'is_superuser': false,
      'is_developer': false,
      'active_items': {
        'tournaments_active': false,
        'events_active': false,
        'users_active': false,
        'templates_active': false,
        'profile_active': false,
        'developer_active': false
      }
    }
  }

  async pre_render() {
    console.log("MenuView::pre_render() called");
    const global = Global.instance();

    if(global.user === null || global.user === undefined) {
      this.model.is_loggedin = false;
      this.model.is_superuser = false;
      this.model.is_developer = false;
      return;
    }

    await global.user.update();

    this.model.is_loggedin = true;
    this.model.is_superuser = global.user.is_superuser();
    this.model.is_developer = global.user.is_developer();
  }

  set_active_menu(item_name) {
    for(let item_key in this.model.active_items) {
      this.model.active_items[item_key] = false;
    }

    let active_key = item_name + '_active';
    this.model.active_items[active_key] = true;
  }
}
