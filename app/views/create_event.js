'use strict';

class CreateEventView extends BaseView {

  constructor(event_id) {
    super();

    this.db = new PouchDB('events');

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

    if(event_id) {
      this.event_id = event_id;

      this.db.get(event_id
      ).then((result) => {
        this.model = result;
        this.render();
      }).catch((err) => {
        console.log(err);
      })
    }

    this.menu = {
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
      this.model.errors = errors;
      this.render();
    } else {
      if(this.event_id == undefined)
        this.model._id = new Date().toJSON();

      this.db.put(this.model);
      router.navigate('home');
    }
  }
}
