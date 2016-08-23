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
  }

  get(player_id) {
    let deferred = new Promise();

    player_db.get(player_id
    ).then((result) => {
      _.merge(this, result);
      deferred.resolve();
    }).catch((err) => {
      console.log(err);
    })

    return deferred;
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
}

