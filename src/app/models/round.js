'use strict';

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

import Model from '../framework/model';
import Collection from '../framework/collection';

import { Event } from './event';
import { Tables } from './table';

export class Round extends Model {

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
      'as_referenced_by': [
        ['round', Tables]
      ]
    }
  }
}

export class Rounds extends Collection {

  get_database() {
    return new PouchDB("rounds");
  }

  get_model_class() {
    return Round;
  }

}
