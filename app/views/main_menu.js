'use strict';

class MainMenuView extends BaseView {

  constructor() {
    super();

    this.template = "main-menu-template";
    this.container = "top-menu";

    this.events = {
      "click": {
        ".tournament_list": () => router.navigate("tournament_list"),
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        }
      }
    }

    this.model = {
      'is_loggedin': false,
      'is_superuser': false,
    }
  }

  pre_render() {
    if(window.user === null || window.user === undefined) {
      this.model.is_loggedin = false;
      this.model.is_superuser = false;
      return;
    }

    this.model.is_loggedin = true;
    this.model.is_superuser = window.user.is_superuser();
  }
}
