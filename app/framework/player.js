'use strict';

class Player {
  constructor() {
    this._id = chance.guid();
    this.user_id = -1;
    this.event_id = -1;

    this.phone_number = "";
    this.address = "";
    this.city = "";
    this.state = "";
    this.zip_code = "";
    this.event = "";

    this.dropped = false;
  }

  randomize() {
    return new Promise((resolve, reject) => {
      let users = new Users();
      let events = new Events();

      users.get_random_user()
        .then( (res) => {
          this.user_id = res._id;
        })
        .then( (res) => {
          return events.get_random_event();
        })
        .then( (res) => {
          return this.event_id = res._id;
        })
        .then( (res) => {
          this.phone_number = chance.phone();
          this.address = chance.address();
          this.city = chance.city();
          this.state = chance.state({ full: true });
          this.zip_code = chance.zip();

          resolve(this);
        })
    });
  }

  get(player_id) {
    let db = new PouchDB('players');

    return new Promise((resolve, reject) => {
      db.get(player_id
      ).then((result) => {
        _.merge(this, result);
        resolve(this);
      }).catch((err) => {
        console.log(err);
        reject(err);
      })
    });
  }

  remove(player_id) {
    let db = new PouchDB('players');

    return new Promise((resolve, reject) => {
      db.get(player_id)
        .then((doc) => {
          resolve(db.remove(doc))
        })
        .catch((err) => {
          console.log(err);
        })
    });
  }

  get_user() {
    let user = new User();

    return user.get_user_by_id(this.user_id); //returns a promise
  }

  save() {
    let db = new PouchDB('players');

    db.put(this);
  }
}

class Players {

  all() {
    let db = new PouchDB('players');

    return new Promise( (resolve, reject) => {
      db.allDocs({include_docs: true})
        .then( (result) => {
          resolve(_.map(result.rows, (x) => x.doc))
        })
        .catch( (err) => reject(err) );
    });
  }

  find(query) {
    let db = new PouchDB('players');

    return new Promise((resolve, reject) => {
      let players = [];

      db.find(query)
        .then((result) => {
          for(let player of result.docs) {
            let new_player = new Player();
            _.merge(new_player, player);
            players.push(new_player);
          }

          resolve(players);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    })
  }

  insert_many(players) {
    let db = new PouchDB('players');

    return new Promise((resolve, reject) => {
      db.bulkDocs(players
      ).then(function (result) {
        resolve(result);
      }).catch(function (err) {
        console.log(err);
        reject();
      });
    });
  }

  drop_all() {
    let db = new PouchDB('players');

    return db.destroy();
  }
}

