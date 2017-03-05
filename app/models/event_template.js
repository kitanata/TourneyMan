'use strict';

class EventTemplate extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
    this.round_names = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: "",
      round_names: [],

      event_name: "",
      game_name: "",

      first_rank_by: "WINS",
      second_rank_by: "POINTS",
      third_rank_by: "POINT_PCT",

      use_buy_player: true,
      buy_player_score_by_average: false,
      buy_player_score: 0
    };
  }

  get_database() {
    return new PouchDB("event_templates");
  }

  get_relationships() {
    return {}
  }

  randomize() {
    let event_part_1 = ["MTG", "Catan", "Legendary", "Acension", "Dominion"];
    let event_part_2 = ["National", "Masters", "Regional"];
    let event_part_3 = ["Qualifier", "Finals", "Semi-Finals"];

    let locations = ["Spiel", "Gencon", "Dragoncon", "PAX East", "BGG.con", "BGF"];

    let round_name_options = [
      ["Round 1", "Round 2", "Round 3"],
      ["Alpha", "Beta", "Charlie"],
      ["Qualifier", "Semi-Finals", "Finals"]
    ]

    let game_name = chance.pickone(event_part_1);
    let event_name = `${game_name} ${chance.pickone(event_part_2)} ${chance.pickone(event_part_3)}`;
    let round_names = chance.pickone(round_name_options);

    let bool_types = [true, false];
    let rank_types = chance.shuffle(["WINS", "POINTS", "POINT_PCT"]);

    this._data = {
      _id: chance.guid(),
      game_name: game_name,
      event_name: event_name,
      location: chance.pickone(locations),
      date: chance.date({string: true}),
      organizer_id: window.user.get_id(),
      round_names: round_names,
      first_rank_by: rank_types[0],
      second_rank_by: rank_types[1],
      third_rank_by: rank_types[2],
      use_buy_player: chance.pickone(bool_types),
      buy_player_score_by_average: chance.pickone(bool_types),
      buy_player_score: chance.floating({min: 0, max: 10})
    };
  }

  from_unpublished_event(event) {
    this.from_view_model(event.to_view_model());

    return event.fetch_related_set('rounds').then( () => {
      this.set('round_names', event.rounds.map( (x) => x.get('name')))
    });
  }

  to_unpublished_event(event) {
    event.from_view_model(this.to_view_model());
  }
}

class EventTemplates extends Collection {

  get_database() {
    return new PouchDB('event_templates');
  }

  get_model_class() {
    return EventTemplate;
  }
}
