'use strict';

// Created to manage circular dependendencies
// when deleting models and collections of models
// and performing cascading deletes.
class DestructionManager {
  constructor() {
    this.models_to_delete = {};
    this.models_to_update = {};

    this.destruction_queue = {};
  }

  destroy(model) {
    let id = model.get_id();

    if(this.models_to_delete[id])
      return Promise.resolve(); //already processed

    this.models_to_delete[id] = model;

    let rels = model.get_relationships();

    if(rels['as_referenced_by'] === undefined)
      return Promise.resolve(); // no other models reference this one

    let promise = Promise.resolve();
    rels = rels['as_referenced_by'];

    for(let rel_name in rels) {
      let rel_cls = rels[rel_name];
      let collection = new rel_cls();

      if(rel_name.slice(-1) == 's') {
        let prop_name = rel_name.slice(0, -1) + '_ids';

        let pair = [[prop_name, {
          "$in": [model.get_id()]
        }]];

        promise = promise.then( () => {
          return collection.fetch_where(_.fromPairs(pair))
        }).then( () => {
          return collection.each( (item) => {
            if(this.models_to_update[item.get_id()]) {
              let stored_model = this.models_to_update[item.get_id()];
              stored_model.remove_related_from_set(rel_name, model);
            } else {
              item.remove_related_from_set(rel_name, model);
              this.models_to_update[item.get_id()] = item;
            }
          });
        });

      } else {
        let cls_name = collection.constructor.name;

        this._queue_destruction(cls_name, rel_cls, [rel_name + '_id', model.get_id()]);
      }
    }

    return promise;
  }

  flush() {
    return this._process_destruction_queue()
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
          this.models_to_delete = {};
          this.models_to_update = {};
        });
      });
  }

  _queue_destruction(cls_name, rel_cls, pair) {
    if(this.destruction_queue[cls_name] === undefined) {
      this.destruction_queue[cls_name] = {
        _class: rel_cls,
        fields: []
      };
    }

    this.destruction_queue[cls_name].fields.push(pair);
  }


  _process_destruction_queue() {
    let promise = Promise.resolve();

    let dequeue = _.clone(this.destruction_queue);
    this.destruction_queue = {};

    for(let cls_name in dequeue) {
      let queries = dequeue[cls_name].fields;
      let cls_obj = dequeue[cls_name]._class;
      let collection = new cls_obj();

      promise = promise.then( () => {

        let fields = {};

        for(let q of queries) {
          if(!fields[q[0]])
            fields[q[0]] = [];

          fields[q[0]].push(q[1]);
        }

        function mapQuery(doc, emit) {
          for(let f in fields) {
            if(_.includes(fields[f], doc[f]))
              emit(doc._id);
          }
        }

        return collection.fetch_by_map_reduce(mapQuery);
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
}

window.deman = new DestructionManager();
