'use strict';

class ListPlayersView extends BaseView {

  constructor() {
    super();

    this.title = "Player List";
    this.template = "list-players";

    this.db = new PouchDB('players');

    this.model = {
      search: ""
    }

    this.menu = {
      "New Player": "create_player",
    }

    this.events = {
      "click": {
        ".on-close": () => {
          router.navigate("back");
        },
        ".player_details": (el) => this.onPlayerClicked(el),
        ".player_delete": (el) => this.onPlayerDeleteClicked(el),
        ".player_delete_confirm": (el) => this.onPlayerDeleteConfirmClicked(el)
      }
    }
  }

  pre_render() {
    let players = new Players();
    let users = new Users();

    players.all()
      .then( (players) => {
        this.model.players = [];

        for(let p of players) {
          let pvm = {
            _id: p.id,
            name: ""
          };

          this.model.players.push(pvm);

          users.get(p.user_id)
            .then( (user) => {
              pvm.name = user.name;
            });
        }

        this.rebind_events();
      });
  }

  post_render() {
    this.create_modal("#deletePlayerConfirm");
  }

  onPlayerClicked(el) {
    let player_id = $(el.currentTarget).data('id');

    router.navigate("create_player", {}, player_id);
  }

  onPlayerDeleteClicked(el) {
    let player_id = $(el.currentTarget).data('id');

    $(".player_delete_confirm").data('id', player_id);
    $("#deletePlayerConfirm").foundation('open');
  }

  onPlayerDeleteConfirmClicked(el) {
    let player_id = $(el.currentTarget).data('id');
    let player = new Player();

    player.remove(player_id)
      .then( (result) => {
        $("#deletePlayerConfirm").foundation('close');
        self.update_model();
      });
  }
}
