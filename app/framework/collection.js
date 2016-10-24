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
    let model_cls = this.get_model_class();

    this.models = [];

    return new Promise( (resolve, reject) => {
      if(ids.length == 0)
        resolve(this.models);

      for(let id of ids) {
        let model = new model_cls();

        console.log("Trying to fetch a single model");
        model.fetch_by_id(id)
          .then( (result) => {
            console.log("Fetched a single model");
            this.models.push(model);

            if(this.models.length == ids.length) {
              resolve(this.models);
            }
          });
      }
    });
  }

  //deletes all models in this collection from the database
  destroy() {
    let promises = [];

    for(let m of this.models) {
      promises.push(m.destroy());
    }

    return Promise.all(promises)
      .then( () => {
        this.models = [];

        return Promise.resolve();
      });
  }

  get_random_model() {
    return new Promise( (resolve, reject) => {
      this.all()
        .then( (result) => {
          resolve(chance.pickone(result));
        })
        .catch( (err) => reject(err) );
    });
  }

  drop_all() {
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
