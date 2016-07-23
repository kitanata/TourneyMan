'use strict';

class CreateEventView extends BaseView {

  constructor() {
    super();

    this.title = "Create an Event";
    this.template = "create-event";

    this.model = {
      'event_name': "",
      'game_name': "",
      'organizer_name': "",
      'location': "",
      'date': "",
      'num_rounds': "",
      'local_admin_password': "",
      'local_admin_salt': "",
    }

    this.events = {
      "click": {
        "#back" : this.go_back_clicked
      }
    }
  }

  go_back_clicked(el) {
    router.navigate("home");
  }
}
