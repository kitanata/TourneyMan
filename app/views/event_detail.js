'use strict';

class EventDetailView extends BaseView {

  constructor(event_id) {
    super();

    this.db = new PouchDB('events');
    this.player_db = new PouchDB('players');

    this.title = "Event Details";
    this.template = "event-detail";

    this.event_id = event_id;

    this.model = {};

    this.db.get(event_id).then(
      (result) => {
        this.model = result;
        console.log(this.model);
        this.render();
      }
    ).catch(
      (err) => console.log(err)
    );

    let self = this;
    this.player_db.find({
      selector: { 
        event_id: this.event_id 
      }
    })
    .then(function (result) {
      self.model.players = result.docs;
      console.log(self.model.players);
      self.render();
    })
    .catch(function (err) {
      console.log(err);
    });

    this.menu = {
      "Begin Round": (el) => this.onBeginRound(el),
      "Rankings": (el) => this.onRankingsClicked(el),
      "Edit Event": (el) => this.onEventEditClicked(el),
      "Back": "home"
    }
  }

  onBeginRound(el) {
  }

  onRankingsClicked(el) {
    router.navigate("player_rankings", this.event_id);
  }

  onEventEditClicked(el) {
    router.navigate("create_event", this.event_id);
  }

}
