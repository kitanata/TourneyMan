'use strict';

class CreateEventView extends BaseView {

  constructor(event_id) {
    super();

    this.db = new PouchDB('events');

    this.title = "Create Event";
    this.template = "create-event";

    this.model = {
      event: {},
      errors: []
    }

    this.event_id = event_id || -1;
    this.event = null;

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        "#on-submit": (el) => this.on_submit(el),
        ".on-close": () => {
          router.navigate("back");
        }
      }
    }

    this.form_constraints = {
      event_name: {
        presence: true,
      }
    }
  }

  pre_render() {
    this.event = new Event();

    if(this.event_id == -1) {
      this.event.create();

      this.model.event = this.event.to_view_model();
      return;
    } 

    this.event.fetch_by_id(this.event_id)
      .then( () => {
        this.model.event = this.event.to_view_model();
      });
  }

  on_submit(el) {
    let errors = validate(this.model.event, this.form_constraints);

    if(errors) {
      this.model.errors = errors;
    } else {
      this.event.from_view_model(this.model.event);
      this.event.organizer = user;

      this.event.save().then( () => {
        window.user.add_related_to_set('organized_events', this.event);
        return window.user.save();
      }).then( () => {
        router.navigate('back');
      });
    }
  }
}
