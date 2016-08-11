"use string";

class Router {

  constructor() {
    this.active_view = null;
    this.last_views = [];

    this.menu_view = new MainMenuView();

    this.routes = {
      "home": HomeView,
      "create_event": CreateEventView,
      "event_detail": EventDetailView,
      "list_players": ListPlayersView,
      "create_player": CreatePlayerView,
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

    let show_back = (this.last_views.length > 0);

    console.log("Rendering Active View");
    this.active_view.render();

    console.log("Rendering Menu View");
    this.menu_view.update(this.active_view, show_back);
    this.menu_view.render();
  }

  _get_view_for_viewname(view_name, args) {
    return new this.routes[view_name](...args);
  }
}
