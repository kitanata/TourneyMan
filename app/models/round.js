'use strict';

class Round extends Model {

  constructor(data) {
    super(data);

    this.event = null;
  }

  init_data() {
    return {
      _id: "",

      event_id: -1,
      table_ids: [],

      name: "",
      started: false,
      seated: false,
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
      seated: this._data.seated,
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
      seated: view_model.seated,
      finished: view_model.finished
    }
  }

  fetch_related() {
    this.event = new Event();

    return new Promise( (resolve, reject) => {
      this.event.fetch_by_id(this._data.event_id)
        .then( () => {
          resolve(this.to_view_model());
        });
    });
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
