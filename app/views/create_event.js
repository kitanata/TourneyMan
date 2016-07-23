'use strict';

class CreateEventView extends BaseView {

  constructor() {
    super();

    this.title = "Create Event";
    this.template = "create-event";

    this.model = {
      event_name: "",
      game_name: "",
      organizer_name: "",
      location: "",
      date: "",
      num_rounds: "",
      local_admin_password: "",
      local_admin_confirm: "",
      local_admin_salt: "",
    }

    this.menu = {
      "home": "Cancel"
    }

    this.events = {
      "click": {
        "#on-submit": (el) => this.on_submit(el)
      }
    }
  }

  on_submit(el) {
    console.log("Submitted");
    console.log(this.model.organizer_name);
  }
}
