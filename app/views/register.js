'use strict';

class RegisterView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "register";

    this.model = {
      name: "",
      email: "",
      password: "",
      confirm: ""
    };

    this.events = {
      "click": {
        ".submit_register": (el) => this.onRegister(el),
        ".login_button": (el) => this.onLoginClicked(el),
      }
    };
  }

  onRegister(el) {
    let user = new User();

    if(this.model.password != this.model.confirm) {
      alert("Passwords do not match!");
    } else {
      user.register(
        this.model.name, 
        this.model.email, 
        this.model.password
      ).then( (res) => {
        user.login(this.model.email, this.model.password)
          .then( (res) => {
            console.log("user logged in");
          })
          .catch( (err) => {
            console.log("Could not log in user");
          });
      }).catch( (err) => {
        alert("Sorry. A user with that email already exists.");
      });
    }
  }

  onLoginClicked(el) {
    router.navigate("login", {replace: true});
  }
}
