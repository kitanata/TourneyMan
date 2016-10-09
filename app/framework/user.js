'use strict';

var ncrypt = require('crypto');

class User {
  constructor() {
    this.authenticated = false;
    this.user = null;
  }

  get_user_by_id(id) {
    let db = new PouchDB('users');

    return db.get(id); //returns a promise
  }

  randomize() {
    let name = chance.name();
    let email = chance.email();
    let pass = chance.word({syllables: 5});

    this.register(name, email, pass);
  }

  register_admin(name, email, password) {
    alert("Admin registration is not yet implemented");
  }

  register(name, email, password) {
    let db = new PouchDB('users');

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
          this._id = chance.guid();

          console.log("Putting the user");
          db.put({
            _id: this._id,
            name: name,
            email: email,
            admin: true
          }).then( (update_res) => {
            this.user = update_res;

            console.log("User Registered. Setting the password.");
            console.log("User: " + this.user);

            this.set_password(password)
              .then((pass_res) => resolve(pass_res))
              .catch((pass_err) => resolve(pass_err))
          });
        }
      });
    });
  }

  authenticate(email, password) {
    let db = new PouchDB('users');

    return new Promise((resolve, reject) => {
      db.find({
        selector: {email: email},
      }).then((result) => {
        let user = result.docs[0];

        let key = ncrypt.pbkdf2Sync(password, user.salt, 100000, 512, 'whirlpool');
        let encrypted = key.toString('hex');

        if(encrypted == user.password) {
          this.user = user;
          this.authenticated = true;

          resolve(this.user);
        } else {
          reject("Username or password is incorrect.");
        }
      }).catch(function (err) {
        reject("Could not find user with email: " + email);
      });
    });
  }

  set_password(password) {
    let db = new PouchDB('users');

    console.log("Setting password");
    console.log(password);
    let salt = ncrypt.randomBytes(256).toString('hex');
    let key = ncrypt.pbkdf2Sync(password, salt, 100000, 512, 'whirlpool')
    let encrypted = key.toString('hex');

    console.log("Salt: " + salt);
    console.log("Encrypted Pass: " + encrypted);

    console.log("ID: " + this._id);

    return new Promise( (resolve, reject) => {

      db.get(this._id).then( (doc) => {
        console.log("Got user. Putting password.");
        console.log(doc);

        db.put({
          _id: this._id,
          _rev: doc._rev,
          name: doc.name,
          email: doc.email,
          admin: doc.admin,
          salt: salt,
          password: encrypted
        }).then( (result) => {
          console.log("Put the user with result: " + result);
          resolve(result);
        }).catch((error) => reject(error))
      });
    });
  }

  logout() {
    this.authenticated = false;
    this.user = null;
  }
}

class Users {

  all() {
    let db = new PouchDB('users');

    return new Promise( (resolve, reject) => {
      db.allDocs({include_docs: true})
        .then( (result) => {
          resolve(_.map(result.rows, (x) => x.doc))
        })
        .catch( (err) => reject(err) );
    });
  }

  get_random_user() {
    return new Promise( (resolve, reject) => {
      this.all()
        .then( (result) => {
          resolve(chance.pickone(result));
        })
        .catch( (err) => reject(err) );
    });
  }

  get(user_id) {
    let db = new PouchDB('users');

    return db.get(user_id);
  }

  drop_all() {
    let db = new PouchDB('users');

    return db.destroy();
  }
}
