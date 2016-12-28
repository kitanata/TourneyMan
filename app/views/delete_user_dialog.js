'use strict';

class DeleteUserDialog extends DialogView {

  constructor(user_id) {
    super();

    this.title = "Delete User";
    this.template = "delete-user-dialog";

    this.user_id = user_id;
    this.user_to_delete = null;

    this.model = { 
      can_delete: false
    }

    this.events = {
      "click": {
        ".user_delete_confirm": () => this.onUserDeleteConfirmClicked()
      }
    }
  }

  pre_render() {
    console.log("DeleteUserDialog::pre_render()");
  }

  onUserDeleteConfirmClicked(el) {
    console.log("DeleteUserDialog::onUserDeleteConfirmClicked");
    console.log(this.user_id);

    if(!window.user.is_superuser()) return; //admin guard

    let user = new User();

    this.start_progress();
    user.fetch_by_id(this.user_id)
      .then( () => {
        return user.destroy();
      })
      .then( () => {
        return this.finish_progress();
      }).then( () => {
        this.close();
      });
  }

}
