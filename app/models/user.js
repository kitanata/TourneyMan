'use strict';

var ncrypt = require('crypto');

class User extends Model {

  constructor(data) {
    super(data);

    this.events = null;
    this.authenticated = false;
  }

  init_data() {
    return {
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
    };
  }

  get_database() {
    return new PouchDB('users');
  }

  get_relationships() {
    return {
      'has_many': {
        'events': Events,
        'event_templates': EventTemplates,
        'tournament_templates': TournamentTemplates,
      },
      'as_referenced_by': [
        ['organizer', Events],
        ['player', Ranks]
      ],
      'as_included_in': [
        ['players', Events]
      ]
    }
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
        if(result.docs.length > 0)  {
          reject("Error: User already exists.");
        }
        else {
          this._data._id = chance.guid();
          this._data.name = name;
          this._data.email = email;
          this._data.admin = true;

          db.put(this._data)
            .then( (result) => {
              this._data._rev = result._rev;

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

    let salt = ncrypt.randomBytes(256).toString('hex');
    let key = ncrypt.pbkdf2Sync(password, salt, 100000, 512, 'whirlpool')
    let encrypted = key.toString('hex');

    return new Promise( (resolve, reject) => {

      db.get(this._data._id).then( (doc) => {
        this._data = doc;
        this._data.salt = salt;
        this._data.password = encrypted;

        db.put(this._data)
          .then( (result) => {
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

  /*fetch_related() {
    this.events = new Events();

    return this.events.fetch_by_ids(this._data.event_ids);
  }*/

}

class Users extends Collection {

  get_database() {
    return new PouchDB("users");
  }

  get_model_class() {
    return User;
  }

}
