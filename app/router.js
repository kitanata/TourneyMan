"use string";

class Router {

  constructor() {
    this.active_view = null;

    this.routes = {
      "main_menu": MainMenuView,
      "create_event": CreateEventView
    }
  }

  navigate(view_name) {
    if(this.active_view)
      this.active_view.unload();

    let new_view = this._get_view_for_viewname(view_name);

    this.active_view = new_view;

    this.active_view.render();
  }

  _get_view_for_viewname(view_name) {
    return new this.routes[view_name]();
  }
}
