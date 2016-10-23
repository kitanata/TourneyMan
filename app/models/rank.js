'use strict';

// Updated when a round's scores are recorded.
// Used to generate table and seats.
// Used to show event based player rankings.

class Rank extends Model {

  init_data() {
    return {
      _id: "",

      competitor_history_ids: [],
      table_history_ids: [],
      seat_history_ids: [],

      event_id: -1,
      player_id: -1,

      score: 0,
      dropped: false
    };
  }

  get_database() {
    return new PouchDB('ranks');
  }

  get_relationships() {
    return {
      'has_a': {
        'event': Event,
        'player': User
      },
      'has_many': {
        'competitor_history': Ranks,
        'table_history': Tables,
        'seat_history': Seats
      }
    }
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

  score_table_fitness(table) {
        //            5 points if open seat in position they haven't had before
        //            1 point for each player they haven't played against
        //            2 points if they haven't played at this table
  }

  fetch_related() {
    return new Promise( (resolve, reject) => {
      this.fetch_related_set('competitor_history')
        .then( () => this.fetch_related_set('table_history') )
        .then( () => this.fetch_related_set('seat_history') )
        .then( () => resolve(this.to_view_model()) );
    });
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
