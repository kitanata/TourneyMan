'use strict';

import { filter, remove, map, find, groupBy, every, includes } from 'lodash';

import logger from './logger';

export default class Collection {
  //Note: Collections do not have relationships

  constructor(models) {
    this.models = models || [];
  }

  get_model_class() {} //override
  get_database() {} //override

  count() {
    return this.models.length;
  }

  count_where(fn) {
    return filter(this.models, fn).length;
  }

  push(model) {
    this.models.push(model);
  }

  get_by_id(id) {
    for(let m of this.models) {
      if(m.get_id() == id)
        return m;
    }

    return null;
  }

  remove(model) {
    remove(this.models, model);
  }

  map(fn) {
    return map(this.models, fn);
  }

  find(fn) {
    return find(this.models, fn);
  }

  group_by(fn) {
    return groupBy(this.models, fn);
  }

  filter(fn) {
    let models = filter(this.models, fn);

    let new_col = new this.constructor();
    new_col.models = models;

    return new_col;
  }

  every(fn) {
    return every(this.models, fn);
  }

  async all() {
    logger.info("Collection::all() called");

    let db = this.get_database();
    let model_class = this.get_model_class();

    let result = await db.allDocs({include_docs: true});

    this.models = [];

    for(let row of result.rows) {
      let new_model = new model_class(row.doc);
      this.models.push(new_model);
    }

    return this.models;
  }

  async fetch_by_ids(ids) {
    logger.info("Collection::fetch_by_ids() called");

    let db = this.get_database();
    let model_cls = this.get_model_class();

    this.models = [];

    if(ids.length == 0)
      return [];

    //Optimization Note: this is the quickest way to do it with PouchDB. :(
    let errors = []
    for(let mid of ids) {
      let m = new model_cls();
      this.models.push(m);

      await m.fetch_by_id(mid);
    }
  }

  async fetch_where(selector) {
    logger.info("Collection::fetch_where() called");

    let db = this.get_database(); 

    let result = await db.find({selector: selector, fields: ['_id']});

    let ids = map(result.docs, (x) => x._id);
    return this.fetch_by_ids(ids);
  }

  async fetch_by_map_reduce(map_reduce) {
    logger.info("Collection::fetch_by_map_reduce() called");

    let db = this.get_database();

    let result = await db.query(map_reduce);
    let ids = map(result.rows, (x) => x.key);
    return this.fetch_by_ids(ids);
  }

  //deletes all models in this collection from the database
  async destroy() {
    logger.info("Collection::destroy() called");

    for(let m of this.models) {
      deman.destroy(m);
    }

    await deman.flush();

    this.models = [];
  }

  //calls fetch_related on each model
  async fetch_related() {
    logger.info("Collection::fetch_related() called");

    for(let m of this.models) {
      await m.fetch_related();
    }
  }

  drop_all() {
    logger.info("Collection::drop_all() called");

    let db = this.get_database(); 
    return db.destroy();
  }

  to_view_models() {
    let view_models = [];

    for(let m of this.models) {
      view_models.push(m.to_view_model());
    }

    return view_models;
  }
}

