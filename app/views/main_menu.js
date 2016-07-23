'use strict';

class MainMenuView extends BaseView {

  constructor() {
    super();

    this.template = "main-menu";
    this.container = "#menu-container";

    this.events = {
      "click": {
        "#create_event" : this.create_event_clicked
      }
    }

    this.model = {
      title: "",
    }
  }

  update(active_view) {
    this.model.title = active_view.title;
  }

  create_event_clicked(el) {
    router.navigate("create_event");
  }
}
