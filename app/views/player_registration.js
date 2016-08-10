'use strict';

class PlayerRegistrationView extends BaseView {

  constructor() {
    super();

    this.event_db = new PouchDB('events');
    this.db = new PouchDB('players');

    this.title = "Event Registration";
    this.template = "player-registration";

    this.model = {
      player: {
        name: "",
        email: "",
        event_id: "",
        phone_number: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        event: "",
      },
      events: {
      },
      errors: []
    }

    this.event_db.allDocs({include_docs: true}).then(
      (result) => {
        this.model.events = _.map(result.rows, (x) => x.doc);
        this.render();
      }
    ).catch(
      (err) => console.log(err)
    );

    this.menu = {
      "Cancel": "home"
    }

    this.events = {
      "click": {
        "#on-submit": (el) => this.on_submit(el)
      }
    }

    this.form_constraints = {
      name: {
        presence: true,
      },
      event_id: {
        presence: true,
      },
      email: {
        presence: true,
        email: true,
      },
      phone_number: {
        presence: true,
      },
      address: {
        presence: true,
      },
      city: {
        presence: true,
      },
      state: {
        presence: true,
      },
      zip_code: {
        presence: true,
        length: {
          is: 5
        },
        format: /\d{5}(-\d{4})?/
      }
    }
  }

  on_submit(el) {
    console.log("On Submit Called");
    let errors = validate(this.model.player, this.form_constraints);

    if(errors) {
      console.log(errors.num_rounds);
      this.model.errors = errors;
      this.render();
    } else {
      this.model._id = new Date().toJSON();
      this.db.put(this.model);
      router.navigate('home');
    }
  }
}
