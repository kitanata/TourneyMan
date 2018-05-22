'use strict';

import $ from 'jquery';

import BaseView from '../framework/base_view';
import Global from '../framework/global';

import { Users } from '../models/user';

export default class ListUsersView extends BaseView {

  constructor() {
    super();

    this.title = "User List";
    this.template = "list-users";

    this.model = {
      is_superuser: Global.instance().user.is_superuser(),
      search: ""
    }

    this.menu = {
      "New User": "create_user",
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          Global.instance().user = null;
          router.navigate("login");
        },
        ".on-close": () => router.navigate("back"),
        ".user_details": (el) => this.onUserClicked(el),
        ".user_delete": (el) => this.onUserDeleteClicked(el),
        ".user_delete_confirm": (el) => this.onUserDeleteConfirmClicked(el)
      }
    }
  }

  async pre_render() {
    router.menu_view.set_active_menu('users');

    let users = new Users();

    let result = await users.all();
    this.model.users = users.to_view_models();

    this.rebind_events();
  }

  post_render() {}

  onUserClicked(el) {
    let user_id = $(el.currentTarget).data('id');

    router.navigate("user_profile", {}, user_id);
  }

  async onUserDeleteClicked(el) {
    const user = Global.instance().user;

    if(!user.is_superuser()) return; //admin guard

    let user_id = $(el.currentTarget).data('id');

    let user_model = new User();
    await user_model.fetch_by_id(user_id);

    if(user.is_superuser() || (user_model.get_id() === user.get_id())) {
      router.open_dialog('delete_model', () => {
        return user_model.destroy();
      });
      router.active_dialog.onClose = () => this.render();
    }
  }

}
