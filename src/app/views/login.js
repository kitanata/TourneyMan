'use strict';

import BaseView from '../framework/base_view';
import Global from '../framework/global';
import { User } from '../models/user';

export default class LoginView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "login";
    this.container = "#login-content";

    this.model = {
      email: "",
      password: "",
    }

    this.events = {
      "click": {
        ".register_button": (el) => this.onRegisterClicked(el),
        ".submit_login": (el) => this.onLoginClicked(el)
      }
    }
  }

  pre_render() {}

  post_render() {}

  async onLoginClicked(el) {
    const user = new User();

    const res = await user.authenticate(this.model.email, this.model.password);

    console.log("User Logged In");
    Global.instance().user = user;

    this.onMyProfileClicked();
  }

  onRegisterClicked(el) {
    router.navigate("register", {replace: true});
  }
}
