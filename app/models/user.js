'use strict';

var ncrypt = require('crypto');

class User extends Model {

  constructor(data) {
    super(data);

    this.events = null;
    this.organized_events = null;
    this.organized_tournaments = null;
    this.event_templates = null;
    this.tournament_templates = null;
    this.authenticated = false;
  }

  init_data() {
    return {
      _id: -1,
      event_ids: [],
      organized_event_ids: [],
      organized_tournament_ids: [],
      event_template_ids: [],
      tournament_template_ids: [],

      global_admin: false,
      admin: false,
      developer: false,
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
    return { 'has_many': {
        'events': Events,
        'organized_events': Events,
        'organized_tournaments': Tournaments,
        'event_templates': EventTemplates,
        'tournament_templates': TournamentTemplates,
      },
      'as_referenced_by': [
        ['organizer', Events],
        ['organizer', EventTemplates],
        ['organizer', Tournaments],
        ['organizer', TournamentTemplates],
        ['player', Ranks]
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

      let user_count = 0;

      db.info().then((info) => {
        user_count = info.doc_count;
      }).then( () => {
        return db.find({
          selector: {"email": email},
          fields: ["_id"]
        })
      }).then( (result) => {
        if(result.docs.length > 0)  {
          reject("Error: User already exists.");
        }
        else {
          this._data._id = chance.guid();
          this._data.name = name;
          this._data.email = email.toLowerCase();

          if(user_count === 0) {
            this._data.admin = true;
            this._data.global_admin = true;
          }

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

  authenticate(email_cs, password) {
    let db = this.get_database();

    let email = email_cs.toLowerCase();

    return new Promise((resolve, reject) => {
      db.find({
        selector: {email: email},
      }).then((result) => {
        let user = result.docs[0];
        let encrypted = this.__get_hash(password, user.salt);

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
    let encrypted = this.__get_hash(password, salt);

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

  __get_hash(password, salt) {
    let key = ncrypt.pbkdf2Sync(password, salt, 300000, 512, 'sha256');
    return key.toString('hex');
  }

  promote() {
    this.set('admin', true);
  }

  demote() {
    if(this.get('global_admin') === false)
      this.set('admin', false);
  }

  enable_developer_mode() {
    this.set('developer', true);
  }

  disable_developer_mode() {
    this.set('developer', false);
  }

  is_developer() {
    return this._data.developer;
  }

  is_superuser() {
    return this._data.admin;
  }

  is_global_superuser() {
    return this._data.global_admin;
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
