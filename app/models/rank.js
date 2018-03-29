'use strict';

// Updated when a round's scores are recorded.
// Used to generate table and seats.
// Used to show event based player rankings.

import PouchDB from 'pouchdb';

import Model from '../framework/model';
import Collection from '../framework/collection';

import { Event } from './event';
import { User } from './user';
import { Tables } from './table';
import { Seats } from './seat';

export class Rank extends Model {

  init_data() {
    return {
      _id: "",

      competitor_history_ids: [],
      table_history_ids: [],
      seat_history_ids: [],

      event_id: -1,
      player_id: -1,

      scores: [],
      score_pcts: [],
      num_wins: 0,

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
      },
      'as_referenced_by': [
        ['rank', Seats]
      ]
    }
  }
}

export class Ranks extends Collection {

  get_database() {
    return new PouchDB("ranks");
  }

  get_model_class() {
    return Rank;
  }

}
