'use strict';

class CreatePlayerView extends BaseView {

  constructor(player_id) {
    super();

    this.event_db = new PouchDB('events');
    this.db = new PouchDB('players');

    this.title = "Player Registration";
    this.template = "create-player";

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

    if(player_id) {
      this.player_id = player_id;
      
      this.db.get(player_id
      ).then((result) => {
        this.model.player = result;
        this.render();
      }).catch((err) => {
        console.log(err);
      })
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
      let player = this.model.player;

      if(this.player_id == undefined) {
        player._id = new Date().toJSON();
      }

      this.db.put(player);
      router.navigate('list_players');
    }
  }
}
