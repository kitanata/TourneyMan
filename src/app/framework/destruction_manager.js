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

    this.destruction_queue = {};
    this.dead_reference_queue = {};

    this.collection_classes = {};
  }

  destroy(model) {
    let id = model.get_id();

    if(this.models_to_delete[id])
      return;

    this.models_to_delete[id] = model;

    let relations = model.get_relationships();

    let as_referenced_by = []
    let as_referenced_in = []

    if(relations['as_referenced_by'] !== undefined) {
      as_referenced_by = relations['as_referenced_by'];
    }

    if(relations['as_referenced_in'] !== undefined) {
      as_referenced_in = relations['as_referenced_in'];
    }

    if(!Array.isArray(as_referenced_by)) {
      logger.error(`Expected 'as_referenced_by' relation setting in <${model.constructor.name}> to be an array.`);
    }

    if(!Array.isArray(as_referenced_in)) {
      logger.error(`Expected 'as_referenced_in' relation setting in <${model.constructor.name}> to be an array.`);
    }

    for(let rel_pair of as_referenced_by) {
      const rel_name = rel_pair[0];
      const rel_cls = rel_pair[1];

      this._add_collection_class(rel_cls);
      this._queue_destruction(rel_cls, rel_name + '_id', model.get_id());
    }

    for(let rel_pair of as_referenced_in) {
      const rel_name = rel_pair[0].slice(0, rel_pair[1].length - 1);
      const rel_cls = rel_pair[1];

      this._add_collection_class(rel_cls);
      this._queue_dead_reference(rel_cls, rel_name + '_ids', model.get_id());
    }

  }

  async flush() {
    await this._process_destruction_queue();
    await this._process_dead_reference_queue();

    for(let key in this.models_to_delete) {
      let m = this.models_to_delete[key];
      await m.update(); //It may have been modified.
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

  _queue_dead_reference(cls, field, id) {
    if(this.dead_reference_queue[cls.name] === undefined) {
      this.dead_reference_queue[cls.name] = [];
    }

    this.dead_reference_queue[cls.name].push([field, id]);
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
      await this._process_destruction_queue();
      return await this._process_dead_reference_queue();
    }

    return;
  }

  async _process_dead_reference_queue() {
    let dequeue = _.clone(this.dead_reference_queue);
    this.dead_reference_queue = {};

    for(let cls_name in dequeue) {
      let queries = dequeue[cls_name];
      let cls_obj = this._get_collection_class(cls_name);
      let collection = new cls_obj();

      await collection.all();

      let q_grps = _.groupBy(queries, (q) => q[0]);
      q_grps = _.map(q_grps, (group) => {
        const group_name = group[0][0];
        const flattened_ids = _.flatten(_.map(group, (item) => item[1]));

        return [group_name, flattened_ids];
      });

      for(let [id_set_name, id_set] of q_grps) {
        for(let model of collection.models) {
          const old_set = model.get(id_set_name);

          if(old_set.length === 0) {
            continue; // no need to update if it's already empty
          }

          const new_set = _.difference(old_set, id_set);

          model.set(id_set_name, new_set);
          await model.save();
        }
      }
    }

    return;
  }
}

