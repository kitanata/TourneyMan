'use strict';

// Created to manage circular dependendencies
// when deleting models and collections of models
// and performing cascading deletes.
class DestructionManager {
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

    /*for(let rel_pair of as_included_in) {
      let rel_name = rel_pair[0];
      let rel_cls = rel_pair[1];

      this._add_collection_class(rel_cls);
      this._queue_dead_reference(rel_cls, rel_name, model.get_id());
    }*/
  }

  flush() {
    return this._process_destruction_queue()
      /*.then( () => {
        return this._process_dead_references();
      })*/
      .then( () => {
        let promises = [];

        //don't update models we're going to delete
        for(let key in this.models_to_delete)
          delete this.models_to_update[key];

        console.log(Object.keys(this.models_to_update).length);
        console.log(Object.keys(this.models_to_delete).length);

        //update these models
        for(let key in this.models_to_update) {
          let m = this.models_to_update[key];

          promises.push(m.save());
        }

        //delete these models
        for(let key in this.models_to_delete) {
          let m = this.models_to_delete[key];

          promises.push(m.__destroy());
        }

        return Promise.all(promises).then( () => {
          this.init();
        });
      });
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

  /*_queue_dead_reference(cls, field, id) {
    if(!this.dead_references[cls.name])
      this.dead_references[cls.name] = {};

    if(!this.dead_references[cls.name][field])
      this.dead_references[cls.name][field] = [];

    this.dead_references[cls.name][field].push(id);
  }*/

  _process_destruction_queue() {
    let promise = Promise.resolve();

    let dequeue = _.clone(this.destruction_queue);
    this.destruction_queue = {};

    for(let cls_name in dequeue) {
      let queries = dequeue[cls_name];
      let cls_obj = this._get_collection_class(cls_name);
      let collection = new cls_obj();

      promise = promise.then( () => {

        let fields = {};

        for(let q of queries) {
          if(!fields[q[0]])
            fields[q[0]] = [];

          fields[q[0]].push(q[1]);
        }

        /*function mapQuery(doc, emit) {
          for(let f in fields) {
            if(_.includes(fields[f], doc[f]))
              emit(doc._id);
          }
        }*/

        let selector = {}
        for(let f in fields) {
          selector[f] = {
            $in: fields[f]
          }
        }

        return collection.fetch_where(selector);
        //return collection.fetch_by_map_reduce(mapQuery);
      }).then( () => {
        // destroy all the objects
        return collection.each( (m) => {
          return this.destroy(m);
        });
      });
    }

    promise = promise.then( () => {
      // if the queue got repopulated then process it again
      if(Object.keys(this.destruction_queue).length != 0) {
        return this._process_destruction_queue();
      } else {
        return Promise.resolve();
      }
    })

    return promise;
  }

  /*_process_dead_references() {
    let promise = Promise.resolve();

    for(let cls_name in this.dead_references) {
      let cls_obj = this._get_collection_class(cls_name);
      let collection = new cls_obj();

      let props = this.dead_references[cls_name];

      promise = promise.then( () => {
        return collection.fetch_by_map_reduce((doc, emit) => {

          // Optimization: If the item is queued to be deleted then
          // don't update it. Just skip.
          if(this.models_to_delete[doc._id])
            return;

          for(let rel_name in props) {
            //remove the s at the end and append _ids
            let prop_name = rel_name.slice(0, -1) + '_ids';

            if(_.intersection(doc[prop_name], props[rel_name]))
              emit(doc._id);
          }
        });
      }).then( () => {
        return collection.each( (item) => {
          let data = _.clone(item._data);

          for(let rel_name in props) {
            item.remove_related_references(rel_name, props[rel_name]);
          }

          if(_.isEqual(data, item._data))
            return; //nothing changed

          if(!this.models_to_update[item.get_id()])
            this.models_to_update[item.get_id()] = item;
          else
            item = this.models_to_update[item.get_id()];
        });
      });
    }

    return promise;
  }*/
}

window.deman = new DestructionManager();
