'use strict';

class Event extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
    this.players = null;
    this.rounds = null;
    this.ranks = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: "",
      round_ids: [],
      player_ids: [],
      rank_ids: [],

      event_name: "",
      game_name: "",
      location: "",
      date: "",
      started: false
    };
  }

  get_database() {
    return new PouchDB("events");
  }

  to_view_model() {
    this.ensure_valid();

    return {
      _id: this._data._id,
      event_name: this._data.event_name,
      game_name: this._data.game_name,
      location: this._data.location,
      date: this._data.date,
      started: this._data.started
    }
  }

  from_view_model(view_model) {
    this.ensure_valid();

    this._data = {
      _id: this._data._id,
      _rev: this._data._rev,
      player_ids: this._data.player_ids,
      round_ids: this._data.round_ids,
      event_name: view_model.event_name,
      game_name: view_model.game_name,
      location: view_model.location,
      date: view_model.date,
      started: view_model.started
    };
  }

  randomize() {
    let event_part_1 = ["MTG", "Catan", "Legendary", "Acension", "Dominion"];
    let event_part_2 = ["National", "Masters", "Regional"];
    let event_part_3 = ["Qualifier", "Finals", "Semi-Finals"];

    let locations = ["Spiel", "Gencon", "Dragoncon", "PAX East", "BGG.con", "BGF"];

    let game_name = chance.pickone(event_part_1);
    let event_name = `${game_name} ${chance.pickone(event_part_2)} ${chance.pickone(event_part_3)}`;

    this._data = {
      _id: chance.guid(),
      game_name: game_name,
      event_name: event_name,
      location: chance.pickone(locations),
      date: chance.date({string: true}),
      organizer_id: window.user.get_id(),
      round_ids: [],
      player_ids: [],
      rank_ids: [],
      started: false
    };
  }

  fetch_related() {
    return new Promise( (resolve, reject) => {
      this.fetch_related_model('organizer', User)
        .then( () => this.fetch_related_set('players', Users))
        .then( () => this.fetch_related_set('rounds', Rounds))
        .then( () => this.fetch_related_set('ranks', Ranks))
        .then( () => resolve(this.to_view_model()) );
    });
  }
}

class Events extends Collection {

  get_database() {
    return new PouchDB('events');
  }

  get_model_class() {
    return Event;
  }
}
