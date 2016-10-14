'use strict';

class Model {

  constructor() {
    this._data = {
      _id: -1
    };
  }

  get_id() {
    return this._data._id;
  }

  has_valid_data() {
    return (this.get_id() !== -1);
  }

  ensure_valid() {
    if(!this.has_valid_data()) {
      console.log("WARNING: Model data is not valid!");
    }
  }

  save() {
    let db = this.get_database();

    return new Promise( (resolve, reject) => {
      db.put(this._data)
        .then( (result) => {
          this._data._rev = result.rev;
          resolve(this.to_view_model());
        })
        .catch( (err) => reject(err))
    });
  }

  fetch_by_id(id) {
    let db = this.get_database();

    return new Promise( (resolve, reject) => {
      db.get(id)
        .then( (doc) => {
          this._data = doc;
          resolve(this.to_view_model());
        })
        .catch( (err) => {
          console.log("Error: " + err);
          reject(err);
        });
    });
  }

  get_database() {}               // override this
  to_view_model() {}              // override this
  from_view_model(view_model) {}  // override this
  fetch_related() {}              // override this

};
