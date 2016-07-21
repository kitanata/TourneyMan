"use string";

class Router {

  constructor() {
    this.active_view = null;

    this.routes = {
      "main_menu": MainMenuView
    }
  }

  navigate(view_name) {
    let view_cls = this.routes[view_name];

    this.active_view = new view_cls();

    this.active_view.render()
  }
}
