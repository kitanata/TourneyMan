'use strict';

class MainMenuView extends BaseView {

  constructor() {
    super();

    this.template = "main-menu";
    this.container = "#menu-container";

    this.events = {
      "click": {
      }
    }

    this.model = {
      title: "",
      menu: [],
    }

    this.menu_events = {};
  }

  update(active_view) {
    this.model.title = active_view.title;

    this.model.menu = [];
    this.menu_events = {};
    for(let key in active_view.menu) {
      this.model.menu.push({
        id: slugify(key),
        text: key
      });

      this.menu_events[slugify(key)] = active_view.menu[key];
    }

    _.each(this.model.menu, (item) =>
      this.events.click['.button'] = (el) => this.on_button_clicked(el)
    );
  }

  on_button_clicked(el) {
    let key = $(el.currentTarget).data('id');

    let menu_event = this.menu_events[key];
    if(_.isString(menu_event))
      router.navigate(menu_event);
    else
      this.menu_events[key](el);
  }
}
