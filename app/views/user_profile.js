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
      can_promote: false,
      can_demote: false,
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
        ".enable-developer-mode": () => this.onEnableDeveloperModeClicked(),
        ".disable-developer-mode": () => this.onDisableDeveloperModeClicked(),
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
    router.menu_view.set_active_menu('profile');

    this.open_events = new Events();

    if(this.user_id) {
      this.user.fetch_by_id(this.user_id)
        .then(() => {
          this.model.user = this.user.to_view_model();

          this.model.can_modify = (this.user.get_id() === window.user.get_id());

          if(window.user.is_superuser()) {
            this.model.can_modify = true;

            if(!this.user.is_superuser())
              this.model.can_promote = (this.user.get_id() != window.user.get_id());
            else
              this.model.can_demote = (this.user.get_id() != window.user.get_id());
          }

          if(window.user.is_global_superuser()) {
            if(this.user.is_developer())
              this.model.can_disable_developer_mode = true;
            else
              this.model.can_enable_developer_mode = true;
          }

          if(this.user.is_global_superuser()) {
            this.model.can_promote = false;
            this.model.can_demote = false;
          }

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

    this.user.promote();

    this.user.save()
      .then( () => {
        this.model.user = this.user.to_view_model();
        this.model.can_promote = false;
        this.model.can_demote = true;
        this.update();
        router.menu_view.render();
      });
  }

  onEnableDeveloperModeClicked() {
    console.log("onEnableDeveloperModeClicked");

    if(!window.user.is_global_superuser())
      return;

    this.user.enable_developer_mode();

    this.user.save()
      .then( () => {
        this.model.user = this.user.to_view_model();
        this.model.can_enable_developer_mode = false;
        this.model.can_disable_developer_mode = true;
        this.update();
        router.menu_view.render();
      });
  }

  onDisableDeveloperModeClicked() {
    console.log("onDisableDeveloperModeClicked");

    if(!window.user.is_global_superuser())
      return;

    this.user.disable_developer_mode();

    this.user.save()
      .then( () => {
        this.model.user = this.user.to_view_model();
        this.model.can_enable_developer_mode = true;
        this.model.can_disable_developer_mode = false;
        this.update();
        router.menu_view.render();
      });
  }

  onDemoteClicked() {
    console.log("onDemoteClicked Called");

    if(!window.user.is_superuser())
      return;

    this.user.demote();

    this.user.save()
      .then( () => {
        this.model.user = this.user.to_view_model();
        this.model.can_promote = true;
        this.model.can_demote = false;
        this.update();
        router.menu_view.render();
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
        return event.fetch_related();
      })
      .then( () => {
        return event.register_player(this.user);
      })
      .then( () => {
        return event.tournament.register_player(this.user);
      })
      .then(() => {
        return this.open_events.all();
      })
      .then(() => {
        this.registered_events = this.user.events;
        this.open_events = this.open_events.difference(this.registered_events);

        this.model.open_events = this.open_events.to_view_models();
        this.model.registered_events = this.user.events.to_view_models();

        this.render();
        this.rebind_events();
      });
  }

  onEventUnregisterClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    let event = new Event();

    event.fetch_by_id(event_id)
      .then( () => {
        return event.fetch_related();
      })
      .then( () => {
        return event.remove_player(this.user);
      })
      .then( () => {
        return event.tournament.remove_player(this.user);
      })
      .then(() => {
        return this.open_events.all();
      })
      .then(() => {
        this.registered_events = this.user.events;
        this.open_events = this.open_events.difference(this.registered_events);

        this.model.open_events = this.open_events.to_view_models();
        this.model.registered_events = this.user.events.to_view_models();

        this.render();
        this.rebind_events();
      });
  }
}
