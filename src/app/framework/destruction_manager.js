'use strict';

import logger from './logger';

// Created to manage circular dependendencies
// when deleting models and collections of models
// and performing cascading deletes.
export default class DestructionManager {
  constructor() {
    this.init();
  }

  init() {
    this.models_to_delete = {};
    this.models_to_update = {};

    this.destruction_queue = {};

    this.dead_references = {};

    this.collection_classes = {};
  }

  destroy(model) {
    let id = model.get_id();

    if(this.models_to_delete[id])
      return;

    this.models_to_delete[id] = model;

    let relations = model.get_relationships();

    let as_referenced_by = []
    //let as_included_in = []

    if(relations['as_referenced_by'] != undefined)
      as_referenced_by = relations['as_referenced_by'];

    //if(relations['as_included_in'] != undefined)
    //  as_included_in = relations['as_included_in'];

    for(let rel_pair of as_referenced_by) {
      let rel_name = rel_pair[0];
      let rel_cls = rel_pair[1];

      this._add_collection_class(rel_cls);
      this._queue_destruction(rel_cls, rel_name + '_id', model.get_id());
    }

  }

  async flush() {
    await this._process_destruction_queue();

    //don't update models we're going to delete
    for(let key in this.models_to_delete)
      delete this.models_to_update[key];

    logger.debug(Object.keys(this.models_to_update).length);
    logger.debug(Object.keys(this.models_to_delete).length);

    //update these models
    for(let key in this.models_to_update) {
      let m = this.models_to_update[key];
      await m.save();
    }

    //delete these models
    for(let key in this.models_to_delete) {
      let m = this.models_to_delete[key];
      await m.__destroy();
    }
    
    this.init();
  }

  _add_collection_class(cls) {
    if(this.collection_classes[cls.name] === undefined) {
      this.collection_classes[cls.name] = cls;
    }
  }

  _get_collection_class(cls_name) {
    return this.collection_classes[cls_name];
  }

  _queue_destruction(cls, field, id) {
    if(this.destruction_queue[cls.name] === undefined) {
      this.destruction_queue[cls.name] = [];
    }

    this.destruction_queue[cls.name].push([field, id]);
  }

  async _process_destruction_queue() {
    let dequeue = _.clone(this.destruction_queue);
    this.destruction_queue = {};

    for(let cls_name in dequeue) {
      let queries = dequeue[cls_name];
      let cls_obj = this._get_collection_class(cls_name);
      let collection = new cls_obj();

      let fields = {};

      for(let q of queries) {
        if(!fields[q[0]])
          fields[q[0]] = [];

        fields[q[0]].push(q[1]);
      }

      let selector = {}
      for(let f in fields) {
        selector[f] = {
          $in: fields[f]
        }
      }

      await collection.fetch_where(selector);

      // destroy all the objects
      for(let m of collection.models) {
        await this.destroy(m);
      }
    }

    // if the queue got repopulated we should process it again
    if(Object.keys(this.destruction_queue).length != 0) {
      return await this._process_destruction_queue();
    }

    return;
  }
}

