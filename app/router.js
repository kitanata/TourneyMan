"use string";

class Router {

  constructor() {
    this.active_view = null;
    this.last_views = [];

    this.menu_view = new MainMenuView();

    this.routes = {
      "home": HomeView,
      "login": LoginView,
      "create_event": CreateEventView,
      "event_detail": EventDetailView,
      "round_detail": RoundDetailView,
      "list_players": ListPlayersView,
      "create_player": CreatePlayerView,
      "dev_tools": DevToolsView
    }
  }

  navigate(view_name, ...args) {
    if(this.active_view) {
      this.active_view.unload();
    }

    if(view_name == "back" && this.last_views.length > 0) {
      this.active_view = this.last_views.pop();

    } else {
      if(this.active_view)
        this.last_views.push(this.active_view);

      this.active_view = this._get_view_for_viewname(view_name, args);
    }

    console.log("Rendering Active View");
    this.active_view.render();

    this.update_menu();
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
