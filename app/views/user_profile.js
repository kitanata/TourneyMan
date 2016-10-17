'use strict';

class UserProfileView extends BaseView {

  constructor(user_id) {
    super();

    this.title = "User Profile";
    this.template = "user-profile";

    this.user = new User();

    this.open_events = null;
    this.registered_events = null;

    this.model = {
      user: {},
      event_search: "",
      password: "",
      confirm: "",
      open_events: [],
      registered_events: [],
      errors: []
    }

    if(user_id) {
      this.user.fetch_by_id(user_id)
        .then((result) => {
          this.model.user = result;
          //this.render();
        });
    }

    this.events = {
      "click": {
        "#on-submit": (el) => this.on_submit(el),
        ".on-close": () => router.navigate('back'),
        ".change-password": () => this.onChangePasswordClicked(),
        ".event-register": (el) => this.onEventRegisterClicked(el),
        ".event-unregister": (el) => this.onEventUnregisterClicked(el),
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

    this.change_password_form_constraints = {
      password: {
        presence: true,
        length: {
          minimum: 8,
        },
        equality: "confirm"
      },
      confirm: {
        presence: true,
        equality: "password"
      }
    }
  }

  pre_render() {
    this.open_events = new Events();

    this.open_events.all()
      .then( (result) => {
        return this.user.fetch_related();
      })
      .then((result) => {
        this.registered_events = this.user.events;
        this.open_events = this.open_events.difference(this.registered_events);

        this.model.open_events = this.open_events.to_view_models();
        this.model.registered_events = this.user.events.to_view_models();

        this.rebind_events();
      });
  }

  post_render() {
    this.create_modal("#password-successful");
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

  onChangePasswordClicked() {
    let errors = validate({ 
      password: this.model.password, 
      confirm: this.model.confirm
    }, this.change_password_form_constraints);

    if(errors) {
      this.model.errors = errors;
      //this.render();
    } else {
      this.user.set_password(this.model.password)
        .then( () => {
          this.model.password = "";
          this.model.confirm = "";

          $("#password-successful").foundation('open');
        })
    }
  }

  onEventRegisterClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    this.user.add_related_by_id('event', event_id);

    let event = new Event();

    this.user.save()
      .then(() => {
        return this.user.fetch_related();
      })
      .then(() => {
        return event.fetch_by_id(event_id);
      })
      .then(() => {
        event.add_related_by_id('player', this.user.get_id());
        return event.save();
      })
      .then(() => {
        return this.open_events.all();
      })
      .then(() => {
        this.registered_events = this.user.events;
        this.open_events = this.open_events.difference(this.registered_events);

        this.model.open_events = this.open_events.to_view_models();
        this.model.registered_events = this.user.events.to_view_models();

        this.rebind_events();
      });
  }

  onEventUnregisterClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    this.user.remove_related_by_id('event', event_id);

    let event = new Event();

    this.user.save()
      .then(() => {
        return this.user.fetch_related();
      })
      .then(() => {
        return event.fetch_by_id(event_id)
      })
      .then(() => {
        event.remove_related_by_id('player', this.user.get_id());
        return event.save();
      })
      .then(() => {
        return this.open_events.all();
      })
      .then(() => {
        this.registered_events = this.user.events;
        this.open_events = this.open_events.difference(this.registered_events);

        this.model.open_events = this.open_events.to_view_models();
        this.model.registered_events = this.user.events.to_view_models();

        this.rebind_events();
      });
  }
}
