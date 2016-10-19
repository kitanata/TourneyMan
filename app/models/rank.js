'use strict';

class Rank extends Model {

  init_data() {
    return {
      _id: "",

      competitor_history_ids: [],
      table_history_ids: [],

      event_id: -1,
      player_id: -1,

      score: 0,
      dropped: false
    };
  }

  get_database() {
    return new PouchDB('ranks');
  }

  to_view_model() {
    return {
      _id: this._data._id,
      score: this._data.score,
      dropped: this._data.dropped
    }
  }

  from_view_model(view_model) {
    this._data = {
      _id: this._data._id,
      _rev: this._data._rev,

      competitor_history_ids: this._data.competitor_history_ids,
      table_history_ids: this._data.table_history_ids,

      event_id: view_model.event_id,
      player_id: view_model.player_id,

      score: view_model.score,
      dropped: view_model.dropped
    }
  }
}

class Ranks extends Collection {

  get_database() {
    return new PouchDB("ranks");
  }

  get_model_class() {
    return Rank;
  }

}
