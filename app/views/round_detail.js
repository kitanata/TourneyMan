'use strict';

class RoundDetailView extends BaseView {

  constructor(round_id) {
    super();

    this.db = new PouchDB('rounds');

    this.title = "Round Details";
    this.template = "round-detail";

    this.round_id = round_id;

    this.menu = {
      "Next Round": (el) => this.onNextRoundClicked(el),
      "Reseat Players": (el) => this.onReseatPlayersClicked(el)
    }

    this.events = {
      "click": {
        ".record_scores": (el) => this.onRecordScoresClicked(el),
        ".drop_player": (el) => this.onDropPlayerClicked(el),
        ".random_scores": (el) => this.onRandomScoresClicked(el)
      }
    }
  }

  pre_render() {
    this.db.get(this.round_id)
      .then((result) => {
        this.model = result;
        this.update();
        this.rebind_events();
      })
      .catch(
        (err) => console.log(err)
      );
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
