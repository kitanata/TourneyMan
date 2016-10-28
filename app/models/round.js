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
      },
      'as_referenced_by': {
        'rounds': Events,
        'round': Tables
      }
    }
  }

  finish_round() {
    if(this.get('finished'))
      return Promise.resolve();

    let promise = Promise.resolve();

    return promise.then( () => {
      return this.fetch_related();
    }).then( () => {
      return this.tables.each( (t) => {
        return t.fetch_related_set('seats');
      });
    }).then( () => {
      return this.tables.each( (t) => {
        return t.seats.each( (s) => {
          return s.fetch_related_model('rank')
            .then( () => {
              let cur_rank_score = s.rank.get('score');
              let seat_score = s.get('score');

              console.log("Setting score");
              s.rank.set('score', cur_rank_score + seat_score);
              return s.rank.save();
            });
        });
      });
    }).then( () => {
      this.set('finished', true);
      return this.save();
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
