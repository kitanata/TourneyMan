'use strict';

class UserProfileView extends BaseView {

  constructor(user_id) {
    super();

    this.title = "User Profile";
    this.template = "user-profile";

    this.user_id = user_id || null;
    this.user = new User();

    this.open_events = null;
    this.registered_events = null;

    this.model = {
      is_superuser: window.user.is_superuser(),
      can_modify: false,
      user: {},
      event_search: "",
      password: "",
      confirm: "",
      open_events: [],
      registered_events: [],
      errors: []
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        "#on-submit": (el) => this.on_submit(el),
        ".promote": () => this.onPromoteClicked(),
        ".demote": () => this.onDemoteClicked(),
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

    if(this.user_id) {
      this.user.fetch_by_id(this.user_id)
        .then(() => {
          this.model.user = this.user.to_view_model();

          this.model.can_modify = (this.user.get_id() == window.user.get_id());

          if(this.model.is_superuser)
            this.model.can_modify = true;

          this.update();
        });
    }

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

  post_render() { }

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

  onPromoteClicked() {
    console.log("onPromoteClicked Called");

    if(!window.user.is_superuser())
      return;

    this.user.set('admin', true);
    this.user.save()
      .then( () => {
        this.model.user = this.user.to_view_model();
        this.update();
      });
  }

  onDemoteClicked() {
    console.log("onDemoteClicked Called");

    if(!window.user.is_superuser())
      return;

    this.user.set('admin', false);
    this.user.save()
      .then( () => {
        this.model.user = this.user.to_view_model();
        this.update();
      });
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

          router.open_dialog('password_changed');
        })
    }
  }

  onEventRegisterClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    let event = new Event();

    event.fetch_by_id(event_id)
      .then( () => {
        this.user.add_related_to_set('events', event);

        return this.user.save();
      })
      .then(() => {
        event.add_related_to_set('players', this.user);
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

    let event = new Event();

    event.fetch_by_id(event_id)
      .then( () => {
        this.user.remove_related_from_set('events', event);

        return this.user.save();
      })
      .then(() => {
        event.remove_related_from_set('players', this.user);
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
