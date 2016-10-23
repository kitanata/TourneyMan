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

  remove() {
    let db = this.get_database();

    return new Promise( (resolve, reject) => {
      db.remove(this._data).then( () => {
        this._data = this.init_data();

        resolve();
      });
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

  set(property, value) {
    this._data[property] = value;
  }

  get(property) {
    return this._data[property];
  }

  add_related_to_set(property, model) {
    let model_set = this._data[this._get_related_set_name(property)];

    model_set.push(model.get_id());

    if(!this[property]) {
      let cls = this._get_related_set_class(property);
      this[property] = new cls();
    }

    this[property].push(model);
  }

  remove_related_from_set(property, model) {
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
    let cls = this._get_related_model_class(property);
    this[property] = new cls();

    let related_model = this[property];

    return related_model.fetch_by_id(this._data[property + '_id']);
  }

  fetch_related_set(property) {
    let cls = this._get_related_set_class(property);
    this[property] = new cls();

    let related_model_set = this[property];
    let id_set = this._data[this._get_related_set_name(property)];

    return related_model_set.fetch_by_ids(id_set);
  }

  remove_related_set(property) {
    this._data[this._get_related_set_name(property)] = [];
  }

  drop_related_set(property) {
    let related_model_set = this[property];

    return new Promise( (resolve, reject) => {
      if(!related_model_set)
        resolve();

      let id_set = this._data[this._get_related_set_name(property)];

      this[property] = null;
      this.remove_related_set(property);

      related_model_set.remove_by_ids(id_set).
        then( (result) => resolve(result) );
    });
  }

  get_database() {}               // override this
  get_relationships() {}          // override this
  to_view_model() {}              // override this
  from_view_model(view_model) {}  // override this
  fetch_related() {}              // override this

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
