'use strict';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

import Model from '../framework/model';
import Collection from '../framework/collection';

import { Event } from './event';
import { Round } from './round';
import { Seats } from './seat';
import { Ranks } from './rank';

export class Table extends Model {

  init_data() {
    return {
      _id: -1,
      event_id: -1,
      round_id: -1,

      seat_ids: [],

      name: ""
    }
  }

  get_database() {
    return new PouchDB('tables');
  }

  get_relationships() {
    return {
      'has_a': {
        'event': Event,
        'round': Round
      },
      'has_many': {
        'seats': Seats
      },
      'as_referenced_by': [
        ['table', Seats]
      ],
      'as_referenced_in': [
        ['table_historys', Ranks]
      ]
    }
  }

  record_scores(scores) {
    this.scores = scores;
  }

  get_player(position) {
    return this.players[position];
  }
}

export class Tables extends Collection {

  get_database() {
    return new PouchDB("tables");
  }

  get_model_class() {
    return Table;
  }

}
