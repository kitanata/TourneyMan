'use strict';

class Collection {

  constructor() {
    this.models = [];
  }

  get_model_class() {} //override
  get_database() {} //override

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
