'use strict';

class Round extends Model {

  init_data() {
    return {
      _id: "",

      event_id: -1,
      table_ids: [],

      name: "",
      started: false,
      finished: false,
    };
  }

  get_database() {
    return new PouchDB('rounds');
  }

  to_view_model() {
    return {
      _id: this._data._id,
      name: this._data.name,
      started: this._data.started,
      finished: this._data.finished
    }
  }

  from_view_model(view_model) {
    this._data = {
      _id: this._data._id,
      _rev: this._data._rev,
      table_ids: this._data.table_ids,

      event_id: view_model.event_id,
      name: view_model.name,
      started: view_model.started,
      finished: view_model.finished
    }
  }
}

class Rounds extends Collection {

  get_database() {
    return new PouchDB("rounds");
  }

  get_model_class() {
    return Round;
  }

}
