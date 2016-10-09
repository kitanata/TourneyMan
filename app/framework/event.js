'use strict';

class Event {
  constructor() {
    this._id = chance.guid();

    this.organizer_id = -1;

    this.event_name = "";
    this.game_name = "";
    this.location = "";
    this.date = "";
    this.num_rounds = 0;
  }

  randomize() {
    let event_part_1 = ["MTG", "Catan", "Legendary", "Acension", "Dominion"];
    let event_part_2 = ["National", "Masters", "Regional"];
    let event_part_3 = ["Qualifier", "Finals", "Semi-Finals"];

    let locations = ["Spiel", "Gencon", "Dragoncon", "PAX East", "BGG.con", "BGF"];

    this.game_name = chance.pickone(event_part_1);
    this.event_name = `${this.game_name} ${chance.pickone(event_part_2)} ${chance.pickone(event_part_3)}`;
    this.location = chance.pickone(locations);
    this.date = chance.date({string: true});
    this.organizer_id = window.user._id;
    this.num_rounds = 3;
  }

  get_organizer() {
    let user = new User();

    return user.get_user_by_id(this.organizer_id); //returns a promise
  }

  save() {
    let db = new PouchDB('events');

    db.put(this);
  }
}

class Events {

  all() {
    let db = new PouchDB('events');

    return new Promise( (resolve, reject) => {
      db.allDocs({include_docs: true})
        .then( (result) => {
          resolve(_.map(result.rows, (x) => x.doc))
        })
        .catch( (err) => reject(err) );
    });
  }

  get_random_event() {
    return new Promise( (resolve, reject) => {
      this.all()
        .then( (result) => {
          resolve(chance.pickone(result));
        })
        .catch( (err) => reject(err) );
    });
  }

  drop_all() {
    let db = new PouchDB('events');

    return db.destroy();
  }
}
