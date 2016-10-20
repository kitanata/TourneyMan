'use strict';

class Seat extends Model {

  init_data() {
    return {
      _id: -1,
      table_id: -1,
      rank_id: -1,

      position: 0,
      score: 0
    }
  }

  get_database() {
    return new PouchDB('seats');
  }
}

class Seats extends Collection {

  get_database() {
    return new PouchDB("seats");
  }

  get_model_class() {
    return Seat;
  }

}

