'use strict';

class CreateEventView extends BaseView {

  initialize() {
    this.template = "create-event";

    this.model = {
    }

    this.events = {
      "click": {
        "#back" : this.go_back_clicked
      }
    }
  }

  go_back_clicked(el) {
    router.navigate("main_menu");
  }
}
