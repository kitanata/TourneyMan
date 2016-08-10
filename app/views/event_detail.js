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

    this.player_db.query(function(doc) {
      if(doc.event_id == event_id)
        emit();
    }).then(function (result) {
      this.models.players = result;
      console.log(this.models.players);
      this.render();
    }).catch(function (err) {
      console.log(err);
    });

    this.menu = {
      "Begin Round": (el) => this.onBeginRound(el),
      "Rankings": (el) => this.onRankingsClicked(el),
      "Back": "home"
    }
  }

  onBeginRound(el) {
  }

  onRankingsClicked(el) {
    router.navigate("player_rankings", this.event_id);
  }
}
