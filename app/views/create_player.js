'use strict';

class CreatePlayerView extends BaseView {

  constructor(player_id) {
    super();

    this.event_db = new PouchDB('events');
    this.db = new PouchDB('players');

    this.title = "Player Registration";
    this.template = "create-player";

    this.model = {
      player: new Player(),
      events: {
      },
      errors: []
    }

    if(player_id) {
      this.model.player.get(player_id)
        .then((result) => this.render());
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
    let errors = validate(this.model.player, this.form_constraints);

    if(errors) {
      this.model.errors = errors;
      this.render();
    } else {
      this.model.player.save();
      router.navigate('list_players');
    }
  }
}
