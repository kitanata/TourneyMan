'use strict';

import BaseView from '../framework/base_view';
import Global from '../framework/global';

import { User } from '../models/user';

export default class RegisterView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "register";
    this.container = "#login-content";

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

  async onRegister(el) {
    let user = new User();

    if(this.model.password != this.model.confirm) {
      alert("Passwords do not match!");
    } else {
      let res = await user.register(
        this.model.name, 
        this.model.email, 
        this.model.password
      );
      
      console.log("User Registered: Logging them in");
      res = await user.authenticate(this.model.email, this.model.password);
      console.log("User logged in.");

      Global.instance().user = user;

      this.onMyProfileClicked();
    }
  }

  onLoginClicked(el) {
    router.navigate("login", {replace: true});
  }
}
