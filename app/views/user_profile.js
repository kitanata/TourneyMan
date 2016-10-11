'use strict';

class UserProfileView extends BaseView {

  constructor(user_id) {
    super();

    this.title = "User Profile";
    this.template = "user-profile";

    this.user = new User();

    this.model = {
      user: {},
      events: {
      },
      errors: []
    }

    if(user_id) {
      this.user.fetch_by_id(user_id)
        .then((result) => {
          this.model.user = result;
          //this.render();
        });
    }

    this.menu = {
    }

    this.events = {
      "click": {
        "#on-submit": (el) => this.on_submit(el),
        ".on-close": () => router.navigate('back'),
      }
    }

    this.form_constraints = {
      name: {
        presence: true,
      },
      email: {
        presence: true,
        email: true,
      },
      phone_number: {
        presence: true,
      },
      address: {
        presence: true,
      },
      city: {
        presence: true,
      },
      state: {
        presence: true,
      },
      zip_code: {
        presence: true,
        length: {
          is: 5
        },
        format: /\d{5}(-\d{4})?/
      }
    }
  }

  on_submit(el) {
    let errors = validate(this.model.user, this.form_constraints);

    if(errors) {
      this.model.errors = errors;
      //this.render();
    } else {
      this.user.from_view_model(this.model.user);
      console.log(this.user);
      this.user.save();
      router.navigate('back');
    }
  }
}
