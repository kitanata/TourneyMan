"use string";

class Router {

  constructor() {
    this.active_view = null;

    this.menu_view = new MainMenuView();

    this.routes = {
      "home": HomeView,
      "create_event": CreateEventView
    }
  }

  navigate(view_name) {
    if(this.active_view)
      this.active_view.unload();

    let new_view = this._get_view_for_viewname(view_name);

    this.active_view = new_view;

    this.active_view.render();

    this.menu_view.update(this.active_view);
    this.menu_view.render();
  }

  _get_view_for_viewname(view_name) {
    return new this.routes[view_name]();
  }
}
