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
      errors: []
    }

    this.menu = {
      "home": "Cancel"
    }

    this.events = {
      "click": {
        "#on-submit": (el) => this.on_submit(el)
      }
    }

    this.form_constraints = {
      event_name: {
        presence: true,
      },
      organizer_name: {
        presence: true,
      },
      num_rounds: {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThan: 1
        }
      },
      local_admin_password: {
        presence: true,
        length: {
          minimum: 6
        }
      }
    }
  }

  on_submit(el) {
    let errors = validate(this.model, this.form_constraints);

    if(errors) {
      console.log(errors.num_rounds);
      this.model.errors = errors;
      this.render();
    } else {
      console.log("Submitted");
      console.log(this.model.organizer_name);
    }
  }
}
