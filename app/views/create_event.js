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
      location: "",
      date: "",
      num_rounds: "",
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
        "#on-submit": (el) => this.on_submit(el),
        "#on-close": () => {
          router.navigate("back");
        }
      }
    }

    this.form_constraints = {
      event_name: {
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
      let new_event = new Event();

      new_event.event_name = model.event_name;
      new_event.game_name = model.game_name;
      new_event.location = model.location;
      new_event.date = model.date;
      new_event.num_rounds = model.num_rounds;
      new_event.organizer_id = window.user._id;

      new_event.save();

      router.navigate('home');
    }
  }
}
