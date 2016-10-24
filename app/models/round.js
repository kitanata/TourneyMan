'use strict';

class Round extends Model {

  constructor(data) {
    super(data);

    this.event = null;
    this.tables = null;
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

  get_relationships() {
    return {
      'has_a': {
        'event': Event
      },
      'has_many': {
        'tables': Tables
      }
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
