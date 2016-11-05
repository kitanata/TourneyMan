'use strict';

class EventListView extends BaseView {

  constructor() {
    super();

    this.title = "TourneyMan";
    this.template = "event-list";

    this.model = {
    }

    this.event_set = null;

    this.events = {
      "click": {
        ".event_create": () => router.navigate("create_event"),
        ".user_list": () => router.navigate("list_users"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        ".event_details": (el) => {
          let event_id = $(el.currentTarget).data('id');
          router.navigate("event_detail", {}, event_id);
        },
        ".event_delete": (el) => this.onEventDeleteClicked(el),
        ".event_delete_confirm": (el) => this.onEventDeleteConfirmClicked(el)
      }
    }
  }

  pre_render() {
    this.event_set = new Events();
    this.event_set.all()
      .then( () => {
        this.model.events = [];
        return this.event_set.each( (e) => {
          let vm = e.to_view_model();
          vm.num_rounds = e.count_related_set('rounds');
          vm.num_players = e.count_related_set('players');
          this.model.events.push(vm);
        });
      })
      .then( () => {
        this.rebind_events();
      });
  }

  post_render() {
    this.create_modal("#deleteEventConfirm")
  }

  onEventDeleteClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    $(".event_delete_confirm").data('id', event_id);
    $("#deleteEventConfirm").foundation('open');
  }

  onEventDeleteConfirmClicked(el) {
    let event_id = $(el.currentTarget).data('id');

    let event = new Event();
    event.fetch_by_id(event_id)
      .then( () => {
        $("#deleteEventConfirm").foundation('close');
        return event.destroy();
      })
      .then( () => {
        this.render();
      });
  }
}
