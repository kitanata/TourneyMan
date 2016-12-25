'use strict';

class ListUsersView extends BaseView {

  constructor() {
    super();

    this.title = "User List";
    this.template = "list-users";

    this.model = {
      is_superuser: user.is_superuser(),
      search: ""
    }

    this.menu = {
      "New User": "create_user",
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".open_admin": () => router.navigate("admin"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        ".on-close": () => router.navigate("back"),
        ".user_details": (el) => this.onUserClicked(el),
        ".user_delete": (el) => this.onUserDeleteClicked(el),
        ".user_delete_confirm": (el) => this.onUserDeleteConfirmClicked(el)
      }
    }
  }

  pre_render() {
    let users = new Users();

    users.all()
      .then( (result) => {
        this.model.users = users.to_view_models();

        this.rebind_events();
      });
  }

  post_render() {
    this.create_modal("#deleteUserConfirm");
  }

  onUserClicked(el) {
    let user_id = $(el.currentTarget).data('id');

    router.navigate("user_profile", {}, user_id);
  }

  onUserDeleteClicked(el) {
    if(!window.user.is_superuser()) return; //admin guard

    let user_id = $(el.currentTarget).data('id');

    $(".user_delete_confirm").data('id', user_id);
    $("#deleteUserConfirm").foundation('open');
  }

  onUserDeleteConfirmClicked(el) {
    if(!window.user.is_superuser()) return; //admin guard

    let user_id = $(el.currentTarget).data('id');
    let user = new User();

    user.remove(user_id)
      .then( (result) => {
        $("#deleteUserConfirm").foundation('close');
        self.update_model();
      });
  }
}
