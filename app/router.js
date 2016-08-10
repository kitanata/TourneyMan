"use string";

class Router {

  constructor() {
    this.active_view = null;

    this.menu_view = new MainMenuView();

    this.routes = {
      "home": HomeView,
      "create_event": CreateEventView,
      "event_detail": EventDetailView,
    }
  }

  navigate(view_name, ...args) {
    if(this.active_view)
      this.active_view.unload();

    let new_view = this._get_view_for_viewname(view_name, args);

    this.active_view = new_view;

    console.log("Rendering Active View");
    console.log(this.active_view);
    this.active_view.render();

    console.log("Rendering Menu View");
    this.menu_view.update(this.active_view);
    this.menu_view.render();
  }

  _get_view_for_viewname(view_name, args) {
    return new this.routes[view_name](...args);
  }
}
