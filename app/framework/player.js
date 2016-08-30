'use strict';

let player_db = new PouchDB('players');

class Player {
  constructor() {
    this._id = chance.guid();
    this.name = "";
    this.email = "";
    this.event_id = 0;
    this.phone_number = "";
    this.address = "";
    this.city = "";
    this.state = "";
    this.zip_code = "";
    this.event = "";

    this.dropped = false;
  }

  randomize() {
    this.name = chance.name();
    this.email = chance.email();
    this.phone_number = chance.phone();
    this.address = chance.address();
    this.city = chance.city();
    this.state = chance.state({ full: true });
    this.zip_code = chance.zip();
  }

  get(player_id) {
    return new Promise((resolve, reject) => {
      player_db.get(player_id
      ).then((result) => {
        _.merge(this, result);
        resolve(this);
      }).catch((err) => {
        console.log(err);
        reject(err);
      })
    });
  }

  save() {
    player_db.put(this);
  }
}

class Players {

  find(query) {
    return new Promise((resolve, reject) => {
      let players = [];

      player_db.find(query)
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
    return new Promise((resolve, reject) => {
      player_db.bulkDocs(players
      ).then(function (result) {
        resolve(result);
      }).catch(function (err) {
        console.log(err);
        reject();
      });
    });
  }

  drop_all() {
    return player_db.destroy();
  }
}

