'use strict';

class Collection {
  //Note: Collections do not have relationships

  constructor() {
    this.models = [];
  }

  get_model_class() {} //override
  get_database() {} //override

  count() {
    return this.models.length;
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
    _.remove(this.models, model);
  }

  each(fn) {
    let iter_promises = [];

    for(let m of this.models) {
      iter_promises.push(fn(m));
    }

    return Promise.all(iter_promises);
  }

  map(fn) {
    return _.map(this.models, fn);
  }

  filter(fn) {
    let models = _.filter(this.models, fn);

    let new_col = new this.constructor();
    new_col.models = models;

    return new_col;
  }

  every(fn) {
    return _.every(this.models, fn);
  }

  all() {
    console.log("Collection::all() called");

    let db = this.get_database();
    let model_class = this.get_model_class();

    return new Promise( (resolve, reject) => {
      db.allDocs({include_docs: true})
        .then( (result) => {

          this.models = [];

          for(let row of result.rows) {
            let new_model = new model_class(row.doc);
            this.models.push(new_model);
          }

          resolve(this.models);
        })
        .catch( (err) => reject(err) );
    });
  }

  fetch_by_ids(ids) {
    console.log("Collection::fetch_by_ids() called");

    let model_cls = this.get_model_class();

    this.models = [];

    return new Promise( (resolve, reject) => {
      if(ids.length == 0)
        resolve(this.models);

      for(let id of ids) {
        let model = new model_cls();

        model.fetch_by_id(id)
          .then( (result) => {
            this.models.push(model);

            if(this.models.length == ids.length) {
              resolve(this.models);
            }
          });
      }
    });
  }

  fetch_where(selector) {
    console.log("Collection::fetch_where() called");

    let db = this.get_database(); 

    return db.find({selector: selector, fields: ['_id']})
      .then( (result) => {
        let ids = _.map(result.docs, (x) => x._id);
        return this.fetch_by_ids(ids);
      })
  }

  //deletes all models in this collection from the database
  destroy() {
    console.log("Collection::destroy() called");

    let promises = [];
    for(let m of this.models) {
      promises.push(deman.destroy(m));
    }

    return Promise.all(promises)
      .then( () => {
        return deman.flush();
      }).then( () => {
        this.models = [];
      });
  }

  //calls fetch_related on each model
  fetch_related() {
    console.log("Collection::fetch_related() called");

    let promises = [];

    for(let m of this.models) {
      promises.push(m.fetch_related());
    }

    return Promise.all(promises);
  }

  get_random_model() {
    console.log("Collection::get_random_model() called");

    return new Promise( (resolve, reject) => {
      this.all()
        .then( (result) => {
          resolve(chance.pickone(result));
        })
        .catch( (err) => reject(err) );
    });
  }

  drop_all() {
    console.log("Collection::drop_all() called");

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

  // Set difference between two collections
  difference(other) {
    let diff_col = new Events();

    let other_ids = _.map(other.models, (x) => x.get_id());

    diff_col.models = _.filter(this.models, (x) => !_.includes(other_ids, x.get_id()));

    return diff_col;
  }
}
