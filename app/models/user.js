'use strict';

var ncrypt = require('crypto');

class User extends Model {

  constructor() {
    super();

    this.events = null;
    this.authenticated = false;

    this._data = {
      _id: -1,
      event_ids: [],

      admin: false,
      name: "",
      email: "",
      phone_number: "",
      address: "",
      city: "",
      state: "",
      zip_code: ""
    }
  }

  get_database() {
    return new PouchDB('users');
  }

  to_view_model() {
    this.ensure_valid();

    return {
      _id: this._data._id,
      admin: this._data.admin,
      name: this._data.name,
      email: this._data.email,
      phone_number: this._data.phone_number,
      address: this._data.address,
      city: this._data.city,
      state: this._data.state,
      zip_code: this._data.zip_code
    }
  }

  from_view_model(view_model) {
    this.ensure_valid();

    this._data = {
      _id: this._data._id,
      _rev: this._data._rev,
      event_ids: this._data.event_ids,

      admin: view_model.admin,
      name: view_model.name,
      email: view_model.email,
      phone_number: view_model.phone_number,
      address: view_model.address,
      city: view_model.city,
      state: view_model.state,
      zip_code: view_model.zip_code
    };
  }

  randomize() {
    let name = chance.name();
    let email = chance.email();
    let pass = chance.word({syllables: 5});

    this.register(name, email, pass)
      .then( (data) => {

        data.phone_number = chance.phone();
        data.address = chance.address();
        data.city = chance.city();
        data.state = chance.state();
        data.zip_code = chance.zip();

        this.from_view_model(data);
        this.save();
      });
  }

  register(name, email, password) {
    let db = this.get_database();

    return new Promise( (resolve, reject) => {

      db.find({
        selector: {"email": email},
        fields: ["_id"]
      }).then( (result) => {
        console.log(result);

        if(result.docs.length > 0)  {
          console.log("User exists");
          reject("Error: User already exists.");
        }
        else {
          console.log("User doesn't exist yet");
          console.log("Putting the user");

          this._data._id = chance.guid();
          this._data.name = name;
          this._data.email = email;
          this._data.admin = true;

          db.put(this._data)
            .then( (result) => {
              this._data._rev = result._rev;

              console.log("User Registered. Setting the password.");
              console.log("User: " + this._data);

              this.set_password(password)
                .then((pass_res) => resolve(pass_res))
                .catch((pass_err) => reject(pass_err))
            });
        }
      });
    });
  }

  authenticate(email, password) {
    let db = this.get_database();

    return new Promise((resolve, reject) => {
      db.find({
        selector: {email: email},
      }).then((result) => {
        let user = result.docs[0];

        let key = ncrypt.pbkdf2Sync(password, user.salt, 100000, 512, 'whirlpool');
        let encrypted = key.toString('hex');

        if(encrypted == user.password) {
          this._data = user;
          this.authenticated = true;

          resolve(this.to_view_model());
        } else {
          reject("Username or password is incorrect.");
        }
      }).catch(function (err) {
        reject("Could not find user with email: " + email);
        console.log(err);
      });
    });
  }

  set_password(password) {
    let db = this.get_database();

    console.log("Setting password");
    console.log(password);
    let salt = ncrypt.randomBytes(256).toString('hex');
    let key = ncrypt.pbkdf2Sync(password, salt, 100000, 512, 'whirlpool')
    let encrypted = key.toString('hex');

    console.log("Salt: " + salt);
    console.log("Encrypted Pass: " + encrypted);

    console.log("ID: " + this._data._id);

    return new Promise( (resolve, reject) => {

      db.get(this._data._id).then( (doc) => {
        console.log("Got user. Putting password.");
        console.log(doc);

        this._data = doc;
        this._data.salt = salt;
        this._data.password = encrypted;

        db.put(this._data)
          .then( (result) => {
            console.log("Put the user with result: ")
            console.log(result);

            this._data._rev = result.rev;
            resolve(this.to_view_model());
          }).catch((error) => reject(error))
      });
    });
  }

  is_superuser() {
    return this._data.admin;
  }

  logout() {
    this.authenticated = false;
    this._data = null;
  }

  fetch_related() {
    this.events = new Events();

    return this.events.fetch_by_ids(this._data.event_ids);
  }

}

class Users extends Collection {

  get_database() {
    return new PouchDB("users");
  }

  get_model_class() {
    return User;
  }

}
