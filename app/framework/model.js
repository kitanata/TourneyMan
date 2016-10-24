'use strict';

class Model {

  constructor(data) {
    if(data) {
      this._data = data;
    } else {
      this._data = this.init_data();
    }

    this._relations = this.get_relationships();
  }

  init_data() {
    return {
      _id: -1
    };
  }

  create() {
    this._data._id = chance.guid();
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
    console.log("Model::save() called");
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

  destroy() {
    console.log("Model::destroy() called");
    let db = this.get_database();

    return new Promise( (resolve, reject) => {
      db.remove(this._data).then( () => {
        this._data = this.init_data();

        resolve();
      });
    });
  }

  fetch_by_id(id) {
    console.log("Model::fetch_by_id() called");
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

  set(property, value) {
    this._data[property] = value;
  }

  get(property) {
    return this._data[property];
  }

  add_related_to_set(property, model) {
    console.log("Model::add_related_to_set() called");
    let model_set = this._data[this._get_related_set_name(property)];

    model_set.push(model.get_id());

    if(!this[property]) {
      let cls = this._get_related_set_class(property);
      this[property] = new cls();
    }

    this[property].push(model);
  }

  remove_related_from_set(property, model) {
    console.log("Model::remove_related_from_set() called");
    let model_set = this._data[this._get_related_set_name(property)];

    _.remove(model_set, (x) => x == model.get_id());

    if(this[property])
      this[property].remove(model);
  }

  //sets 1-1 relation
  set_related_model(property, item) {
    this._data[property + '_id'] = item.get_id();
  }

  fetch_related_model(property) {
    console.log("Model::fetch_related_model() called");
    let cls = this._get_related_model_class(property);
    this[property] = new cls();

    let related_model = this[property];

    return related_model.fetch_by_id(this._data[property + '_id']);
  }

  fetch_related_set(property) {
    console.log("Model::fetch_related_set() called");
    let cls = this._get_related_set_class(property);
    this[property] = new cls();

    let related_model_set = this[property];
    let id_set = this._data[this._get_related_set_name(property)];

    return related_model_set.fetch_by_ids(id_set);
  }

  remove_related_set(property) {
    this._data[this._get_related_set_name(property)] = [];
  }

  // destroys all related objects in the set of property
  // fetches them first if needed
  // make sure to save "this" afterwards
  destroy_related_set(property) {
    console.log("Model::destroy_related_set() called");
    let related_model_set = this[property];

    let destroy_promise = Promise.resolve();

    if(!related_model_set) {
      destroy_promise = this.fetch_related_set(property)
        .then( () => {
          related_model_set = this[property];

          return Promise.resolve();
        });
    }

    return destroy_promise
      .then( () => {
        return related_model_set.destroy()
      })
      .then( () => {
        this[property] = null;
        this.remove_related_set(property);

        return Promise.resolve();
      });
  }

  get_database() {}               // override this
  get_relationships() {}          // override this

  to_view_model() {
    this.ensure_valid();

    let view_model = {};

    for(let key in this._data) {
      if(!key.includes('_id'))
        view_model[key] = this._data[key];
    }

    view_model['_id'] = this._data['_id'];

    return view_model;
  }

  from_view_model(view_model) {
    this.ensure_valid();

    for(let key in view_model) {
      // Note: should never be able to set the id
      // of the model, or any of it's relations directly.
      if(key.includes('_id'))
        continue;

      if(this._data[key])
        this._data[key] = view_model[key];
    }
  }

  fetch_related() {
    console.log("Model::fetch_related() called");
    let p = Promise.resolve();

    let has_a = this._relations['has_a'];
    let has_many = this._relations['has_many'];

    if(has_a) {
      for(let key in has_a) {
        p = p.then( () => {
          return this.fetch_related_model(key);
        });
      }
    }

    if(has_many) {
      for(let key in has_many) {
        p = p.then( () => {
          return this.fetch_related_set(key);
        });
      }
    }

    return p.then( () => {
      return this.to_view_model();
    })
  }

  _get_related_set_name(property) {
    if(property.slice(-1) == 's')
      return property.slice(0, -1) + '_ids';
    else
      return property + '_ids';
  }

  _get_related_set_class(property) {
    return this._relations['has_many'][property];
  }

  _get_related_model_class(property) {
    return this._relations['has_a'][property];
  }

};
