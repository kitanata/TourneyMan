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
  }

  update(active_view) {
    this.model.title = active_view.title;

    this.model.menu = _.map(
      _.toPairs(active_view.menu),
      item => ({id: item[0], text: item[1] })
    );

    _.each(this.model.menu, (item) =>
      this.events.click[`#${item.id}`] = this.on_button_clicked
    );
  }

  on_button_clicked(el) {
    router.navigate($(el.currentTarget).attr('id'));
  }
}
