'use strict';

class Tournament extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
    this.players = null;

    this.rounds = null;
    this.ranks = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: "",
      player_ids: [],
      rank_ids: [],
      event_ids: [],

      tournament_name: "",
      published: false,
      started: false
    };
  }

  get_database() {
    return new PouchDB("tournaments");
  }

  get_relationships() {
    return {
      'has_a': {
        'organizer': User
      },
      'has_many': {
        'events': Events,
        'ranks': Ranks
      },
      'as_referenced_by': {
        'tournament': Events
      }
    }
  }

  create_from_template(tournament_template) {
    this.create();

    this.organizer = tournament_template.organizer;
    this.set('name', tournament_template.get('name'));

    let event_templates = tournament_template.get('event_templates');

    let templ_mappings = {}
    let create_promises = [];

    for(let cur_templ of event_templates) {
      let event_templ = new EventTemplate();
      let p = event_templ.fetch_by_id(cur_templ.event_template_id)
        .then( () => {
          let event = new Event();
          return event.create_from_template(event_templ).then( () => {
            templ_mappings[cur_templ.event_template_id] = {
              event: event,
              template: cur_templ
            };
          });
        });

      create_promises.push(p);
    }

    let fix_promises = [];
    Promise.all(create_promises).then( () => {

      for(let cur_templ of event_templates) {
        let cur_mapping = templ_mappings[cur_templ.event_template_id];
        cur_mapping.event.next_event = templ_mappings[cur_mapping.template.next_event_id].event;
        fix_promises.push(cur_mapping.event.save());
      } 
    });

    return Promise.all(fix_promises);
  }

  //checks for registration without needing to fetch related models
  is_player_registered(player) {
    return _.includes(this._data.player_ids, player.get_id());
  }
}

class Tournaments extends Collection {

  get_database() {
    return new PouchDB('tournaments');
  }

  get_model_class() {
    return Tournament;
  }
}
