'use strict';

class Event extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
    this.next_event = null;
    this.players = null;
    this.rounds = null;
    this.ranks = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: "",
      next_event_id: "",
      round_ids: [],
      player_ids: [],
      rank_ids: [],

      event_name: "",
      game_name: "",
      location: "",
      date: "",
      inivitational: false,
      published: false,
      started: false,

      first_rank_by: "WINS",
      second_rank_by: "POINTS",
      third_rank_by: "POINT_PCT",

      use_buy_player: true,
      buy_player_score_by_average: false,
      buy_player_score: 0
    };
  }

  get_database() {
    return new PouchDB("events");
  }

  get_relationships() {
    return {
      'has_a': {
        'organizer': User,
        'next_event': Event
      },
      'has_many': {
        'players': Users,
        'rounds': Rounds,
        'ranks': Ranks
      },
      'as_referenced_by': {
        'event': Ranks, 
        'event': Rounds, 
        'event': Tables
      },
      'as_included_in': {
        'events': Users
      }
    }
  }

  randomize() {
    let event_part_1 = ["MTG", "Catan", "Legendary", "Acension", "Dominion"];
    let event_part_2 = ["National", "Masters", "Regional"];
    let event_part_3 = ["Qualifier", "Finals", "Semi-Finals"];

    let locations = ["Spiel", "Gencon", "Dragoncon", "PAX East", "BGG.con", "BGF"];

    let game_name = chance.pickone(event_part_1);
    let event_name = `${game_name} ${chance.pickone(event_part_2)} ${chance.pickone(event_part_3)}`;

    let bool_types = [true, false];
    let rank_types = chance.shuffle(["WINS", "POINTS", "POINT_PCT"]);

    this._data = {
      _id: chance.guid(),
      game_name: game_name,
      event_name: event_name,
      location: chance.pickone(locations),
      date: chance.date({string: true}),
      organizer_id: window.user.get_id(),
      round_ids: [],
      player_ids: [],
      rank_ids: [],
      started: false,
      first_rank_by: rank_types[0],
      second_rank_by: rank_types[1],
      third_rank_by: rank_types[2],
      use_buy_player: chance.pickone(bool_types),
      buy_player_score_by_average: chance.pickone(bool_types),
      buy_player_score: chance.floating({min: 0, max: 10})
    };
  }

  create_from_template(event_template) {
    this.create();
    event_template.to_unpublished_event(this);

    this.organizer = window.user;
    this.set('date', moment().format('L'));

    return this.save().then( () => {
      let round_names = event_template.get('round_names');

      let save_promises = [];

      for(name of round_names) {
        let new_round = new Round();
        new_round.create();
        new_round.event = event;
        new_round.set('name', name);
        this.add_related_to_set('rounds', new_round);
        save_promises.push(new_round.save());
      }

      return Promise.all(save_promises);
    }).then( () => {
      return this.save();
    });
  }

  //checks for registration without needing to fetch related models
  is_player_registered(player) {
    return _.includes(this._data.player_ids, player.get_id());
  }
}

class Events extends Collection {

  get_database() {
    return new PouchDB('events');
  }

  get_model_class() {
    return Event;
  }
}
