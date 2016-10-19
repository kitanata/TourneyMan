'use strict';

class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.title = "Round Details";
    this.template = "round-detail";

    this.model = {
    };

    this.round = new Round();
    this.round_id = round_id;

    this.events = {
      "click": {
        ".seat-players": () => this.onSeatPlayersClicked(),
        /*".record_scores": (el) => this.onRecordScoresClicked(el),
        ".drop_player": (el) => this.onDropPlayerClicked(el),*/
        ".generate-random-scores": (el) => this.onRandomScoresClicked(el),
        ".on-close": () => router.navigate("back")
      }
    }
  }

  pre_render() {
    this.round.fetch_by_id(this.round_id)
      .then( () => {
        this.model.round = this.round.to_view_model();

        return this.round.fetch_related();
      }).then( () => {
        this.model.event = this.round.event.to_view_model();

        this.rebind_events();
      });
  }

  onSeatPlayersClicked() {
    console.log("onSeatPlayersClicked");
  }

  onRecordScoresClicked(el) {
    this.db.put(this.model);
    this.render();
  }

  onDropPlayerClicked(el) {
    let table_id = $(el.currentTarget).data('id');
    let seat_idx = $(el.currentTarget).data('idx');

    let table = _.find(this.model.tables, function(item) { return item.id == table_id; });

    table.players[seat_idx].dropped = !table.players[seat_idx].dropped;
    this.db.put(this.model);
    this.render();
  }

  onRandomScoresClicked(el) {
    _.each(this.model.tables, (t) => {
      for(var i=0; i < t.positions; i++) {
        t.scores[i] = chance.integer({min: 0, max: 20});
      }
    });

    this.db.put(this.model);
    this.render();
  }

  onNextRoundClicked(el) {
    console.log("Start the next round");
  }

  onReseatPlayersClicked(el) {
    console.log("Reseat the players");
  }
}
