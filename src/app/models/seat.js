'use strict';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

import Model from '../framework/model';
import Collection from '../framework/collection';

import { Table } from './table';
import { Rank } from './rank';

export class Seat extends Model {

  init_data() {
    return {
      _id: -1,
      table_id: -1,
      rank_id: -1,

      position: 0,
      score: 0,
      won: false
    }
  }

  get_database() {
    return new PouchDB('seats');
  }

  get_relationships() {
    return {
      'has_a': {
        'table': Table,
        'rank': Rank
      }
    }
  }

  is_occupied() {
    return this._data.rank_id != -1;
  }
}

export class Seats extends Collection {

  get_database() {
    return new PouchDB("seats");
  }

  get_model_class() {
    return Seat;
  }

}

