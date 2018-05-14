'use strict';

import { difference } from 'lodash';
import Chance from 'chance';

import logger from './logger';

const chance = new Chance();

export default class Model {

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
      logger.warn("WARNING: Model data is not valid!");
    }
  }

  update() {
    logger.info("Model::update() called");
    this.ensure_valid();

    return this.fetch_by_id(this.get_id());
  }

  async save() {
    logger.info("Model::save() called");
    const trace = new Error().stack;

    this.ensure_valid();
    let db = this.get_database();

    // update model _id properties based on has_a relationships
    // eg. event = new Event();
    // event.organizer = user;
    // event.save();
    let has_a = this._relations['has_a'];

    if(has_a) {
      for(let key in has_a) {
        let data_prop = key + '_id';

        if(this[key] === null)
          continue;

        if(this[key] === undefined)
          continue;

        if(!this.has_valid_data())
          continue;

        this._data[data_prop] = this[key].get_id();
      }
    }

    //save it.
    let result = await db.put(this._data
    ).catch( (error) => {
      console.log(trace);
      throw new Error(`Could not save data. Document Update Conflict in model "${this.constructor.name}"`);
    });

    this._data._rev = result.rev;
    return this.to_view_model();
  }

  destroy() {
    logger.info("Model::destroy() called");
    this.ensure_valid();

    deman.destroy(this);
      
    return deman.flush();
  }

  async fetch_by_id(id) {
    logger.info("Model::fetch_by_id() called");
    let db = this.get_database();

    if(id === null) {
      logger.error("Fetch request in database: " + db.name + " with null ID value");
      return;
    }

    if(id === undefined) {
      logger.error("Fetch request in database: " + db.name + " with undefined ID value");
      return;
    }

    if(id === "") {
      logger.error("Fetch request in database: " + db.name + " with empty('') ID value");
      return;
    }

    let doc = await db.get(id);
    this._data = doc;
    return this.to_view_model();
  }

  set(property, value) {
    this._data[property] = value;
  }

  get(property) {
    return this._data[property];
  }

  add_related_to_set(property, model) {
    logger.info("Model::add_related_to_set() called");
    let model_set = this._data[this._get_related_set_name(property)];

    model_set.push(model.get_id());

    if(!this[property]) {
      let cls = this._get_related_set_class(property);
      this[property] = new cls();
    }

    this[property].push(model);
  }

  remove_related_from_set(property, model) {
    logger.info("Model::remove_related_from_set() called");
    let model_set = this._data[this._get_related_set_name(property)];

    _.remove(model_set, (x) => x == model.get_id());

    if(this[property])
      this[property].remove(model);
  }

  //should be used without fetch_related
  remove_related_references(property, ids) {
    logger.info("Model::remove_related_references() called");
    let prop_name = this._get_related_set_name(property);
    let model_set = this._data[prop_name];

    this._data[prop_name] = difference(model_set, ids);
  }

  //should be used without fetch_related
  remove_related_reference(property, id) {
    logger.info("Model::remove_related_reference() called");
    this.remove_related_references(property, [id]);
  }

  fetch_related_model(property) {
    logger.info("Model::fetch_related_model() called");
    let cls = this._get_related_model_class(property);
    this[property] = new cls();

    let related_model = this[property];
    let id = this._data[property + '_id'];

    return related_model.fetch_by_id(id).catch( (error) => {
      logger.fatal("Catched error in fetch_related_model");
      logger.fatal("TODO TODO TODO. HANDLE THIS CORRECTLY! DEAD REFERENCE!!!");
      logger.fatal(error);
    });
  }

  fetch_related_set(property) {
    logger.info("Model::fetch_related_set() called");
    let cls = this._get_related_set_class(property);
    this[property] = new cls();

    let related_model_set = this[property];
    let id_set = this._data[this._get_related_set_name(property)];

    return related_model_set.fetch_by_ids(id_set)
      .catch( (errors) => {
        logger.error("Errors in Model::fetch_related_set() removing dead references.");
        logger.error(errors);

        if(!Array.isArray(errors))
          errors = [errors];

        let remove_reference_ids = [];

        for(let err of errors) {
          logger.error(err);
          if(err.message === "missing" && err.reason === "deleted") {
            let error_cls = err[0];
            let error_id = err[1];

            remove_reference_ids.push(error_id);
          }
        }

        this.remove_related_references(property, remove_reference_ids);
        return this.save();
      });
  }

  count_related_set(property) {
    logger.info("Model::count_related_set() called");
    return this._data[this._get_related_set_name(property)].length;
  }

  remove_related_set(property) {
    this._data[this._get_related_set_name(property)] = [];
  }

  // destroys all related objects in the set of property
  // fetches them first if needed
  // make sure to save "this" afterwards
  async destroy_related_set(property) {
    logger.info("Model::destroy_related_set() called");
    let related_model_set = this[property];

    if(!related_model_set) {
      await this.fetch_related_set(property)
      related_model_set = this[property];
    }

    await related_model_set.destroy();

    this[property] = null;
    this.remove_related_set(property);
  }

  get_database() {}               // override this
  get_relationships() {}          // override this

  to_view_model() {
    this.ensure_valid();

    let view_model = {};

    for(let key in this._data) {
      if(!key.includes('_id') && key != "_rev")
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

      if(key == "_rev")
        continue;

      if(this._data[key] !== undefined)
        this._data[key] = view_model[key];
    }
  }

  async fetch_related() {
    logger.info("Model::fetch_related() called");
    let has_a = this._relations['has_a'];
    let has_many = this._relations['has_many'];

    if(has_a) {
      for(let key in has_a) {
        await this.fetch_related_model(key);
      }
    }

    if(has_many) {
      for(let key in has_many) {
        await this.fetch_related_set(key);
      }
    }

    return this.to_view_model();
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

  async __destroy() {
    let db = this.get_database();

    await db.remove(this._data);
    this._data = this.init_data();
  }

};
