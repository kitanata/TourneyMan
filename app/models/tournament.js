'use strict';

class Tournament extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
    this.players = null;
    this.events = null;
    this.rounds = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: "",
      player_ids: [],
      event_ids: [],

      name: "",
      published: false,
      closed: false
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
        'players': Users
      },
      'as_referenced_by': [
        ['tournament', Events]
      ]
    }
  }

  async create_from_template(tournament_template) {
    this.create();

    this.organizer = window.user;
    this.set('name', tournament_template.get('name'));

    let event_templates = tournament_template.get('event_templates');

    let created_events = [];

    for(let cur_templ of event_templates) {
      let event_templ = new EventTemplate();

      await event_templ.fetch_by_id(cur_templ.event_template_id);

      let event = new Event();

      await event.create_from_template(event_templ);
        
      created_events.push({
        event_template_id: cur_templ.event_template_id,
        event: event,
        template: cur_templ
      });
    }

    for(let cur_mapping of created_events) {
      if(cur_mapping.template.next_event_id !== null) {
        let next_mapping = _.find(created_events, (e) => {
          return (e.event_template_id === cur_mapping.template.next_event_id);
        });

        cur_mapping.event.next_event = next_mapping.event;
      }

      cur_mapping.event.tournament = this;

      await cur_mapping.event.save();
      this.add_related_to_set('events', cur_mapping.event);
    } 

    await this.save();

    window.user.add_related_to_set('organized_tournaments', this);
    await window.user.save();
  }

  async register_player(player) {
    await this.update();

    this.add_related_to_set('players', player);
    await this.save();
  }

  async remove_player(player) {
    await this.update();

    this.remove_related_from_set('players', player);
    await this.save();
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
