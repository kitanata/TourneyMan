"use string";

class Router {

  constructor() {
    this.active_view = null;
    this.active_dialog = null;
    this.last_views = [];

    this.menu_view = new MainMenuView();

    this.routes = {
      "login": LoginView,
      "register": RegisterView,
      "event_list": EventListView,
      "create_event": CreateEventView,
      "event_detail": EventDetailView,
      "round_detail": RoundDetailView,
      "list_users": ListUsersView,
      "user_profile": UserProfileView,
      "create_player": CreatePlayerView,
      "admin": AdminView
    }

    this.dialogs = {
      "move_player": MovePlayerDialog
    }
  }

  navigate(view_name, options, ...args) {
    let _options = options || {};

    if(this.active_view) {
      this.active_view.unload();
    }

    if(view_name == "back" && this.last_views.length > 0) {
      this.active_view = this.last_views.pop();

    } else {
      let replace = _options.replace || false;

      if(!replace && this.active_view)
        this.last_views.push(this.active_view);

      this.active_view = this._get_view_for_viewname(view_name, args);
    }

    console.log("Rendering Active View");
    $("#content").empty();
    this.active_view.render($("#content"));
  }

  open_dialog(dialog_name, ...args) {
    if(this.active_dialog) {
      this.active_dialog.close();
      this.active_dialog.unload();

      $("[role='dialog']").remove();
    }

    this.active_dialog = this._get_dialog_for_dialog_name(dialog_name, args);

    console.log("Rendering Active Dalog");
    $("#dialog").empty();
    this.active_dialog.render($("#dialog"));
    this.active_dialog.open();
  }

  _get_view_for_viewname(view_name, args) {
    return new this.routes[view_name](...args);
  }

  _get_dialog_for_dialog_name(dialog_name, args) {
    return new this.dialogs[dialog_name](...args);
  }
}
