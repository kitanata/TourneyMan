"use string";

class Router {

  constructor() {
    this.active_view = null;
    this.last_views = [];

    this.menu_view = new MainMenuView();

    this.routes = {
      "login": LoginView,
      "register": RegisterView,
      "admin_dashboard": AdminDashboardView,
      "create_event": CreateEventView,
      "event_detail": EventDetailView,
      "round_detail": RoundDetailView,
      "list_players": ListPlayersView,
      "list_users": ListUsersView,
      "user_profile": UserProfileView,
      "create_player": CreatePlayerView,
      "dev_tools": DevToolsView
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
    this.active_view.render();

    //this.update_menu();
  }

  update_menu() {
    console.log("Rendering Menu View");
    let show_back = (this.last_views.length > 0);

    this.menu_view.update(this.active_view, show_back);
    this.menu_view.render();
  }

  _get_view_for_viewname(view_name, args) {
    return new this.routes[view_name](...args);
  }
}
