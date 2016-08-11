'use strict';

class ListPlayersView extends BaseView {

  constructor() {
    super();

    this.title = "Player List";
    this.template = "list-players";

    this.db = new PouchDB('players');

    this.model = {
    }

    this.menu = {
      "New Player": "create_player",
    }

    this.events = {
      "click": {
        ".player_details": (el) => this.onPlayerClicked(el),
        ".player_delete": (el) => this.onPlayerDeleteClicked(el),
        ".player_delete_confirm": (el) => this.onPlayerDeleteConfirmClicked(el)
      }
    }

    this.update_model();
  }

  update_model() {
    this.db.allDocs({include_docs: true}).then(
      (result) => {
        this.model.players = _.map(result.rows, (x) => x.doc);
        this.rebind_events();
        this.render();
      }
    ).catch(
      (err) => console.log(err)
    );
  }

  post_render() {
    let delete_confirm_modal = new Foundation.Reveal($("#deletePlayerConfirm"), {});
  }

  onPlayerClicked(el) {
    let player_id = $(el.currentTarget).data('id');

    router.navigate("create_player", player_id);
  }

  onPlayerDeleteClicked(el) {
    let player_id = $(el.currentTarget).data('id');

    $(".player_delete_confirm").data('id', player_id);
    $("#deletePlayerConfirm").foundation('open');
  }

  onPlayerDeleteConfirmClicked(el) {
    let player_id = $(el.currentTarget).data('id');

    let self = this;

    this.db.get(player_id).then(function(doc) {
      return self.db.remove(doc);
    }).then(function (result) {
      $("#deletePlayerConfirm").foundation('close');
      self.update_model();
    }).catch(function (err) {
      console.log(err);
    });
  }
}
