'use strict';

class CreateEventView extends BaseView {

  constructor() {
    super();

    this.title = "Create Event";
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

    this.menu = {
      "home": "Go Back"
    }
  }
}
