'use strict';

// Created to manage circular dependendencies
// when deleting models and collections of models
// and performing cascading deletes.
class DestructionManager {
  constructor() {
    this.models = {};
  }

  destroy(model) {
    let id = model.get_id();

    if(this.models[id])
      return Promise.resolve(); //already processed

    this.models[id] = model;

    let rels = model.get_relationships();

    if(rels['as_referenced_by'] === undefined)
      return Promise.resolve(); // no other models reference this one

    let promises = [];
    rels = rels['as_referenced_by'];

    for(let [rel_name, rel_cls] of rels.entries()) {
      let collection = new rel_cls();

      if(rel_name.slice(-1) == 's') {
        let prop_name = rel_name.slice(0, -1) + '_ids';

        let p = collection.fetch_where({
          prop_name: { 
            "$in": [this.get_id()]
          } 
        }).then( () => {
          return collection.each( (item) => {
            item.remove_related_from_set(rel_name, this);
            return item.save();
          });
        });

        promises.push(p);
      } else {
        let prop_name = rel_name + '_id';
        let p = collection.fetch_where({
          prop_name: this.get_id()
        }).then( () => {
          return collection.each( (m) => {
            return deman.destroy(m);
          });
        });

        promises.push(p);
      }
    }

    return Promise.all(promises);
  }

  flush() {
    let promises = [];

    for(let [id, m] of this.models.entries()) {
      promises.push(m.__destroy());
    }

    return Promise.all(promises).then( () => {
      this.models = {};
    });
  }
}

window.deman = new DestructionManager();
