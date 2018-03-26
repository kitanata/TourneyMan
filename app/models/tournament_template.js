'use strict';

import Model from '../framework/model';
import Collection from '../framework/collection';

class TournamentTemplate extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: -1,
      name: "",
      event_templates: []
    };
  }

  get_relationships() {
    return {
      'has_a': {
        'organizer': User
      }
    }
  }

  get_database() {
    return new PouchDB("tournament_templates");
  }

  create_tournament() {
    console.log("Create a tournament");
  }
}

class TournamentTemplates extends Collection {

  get_database() {
    return new PouchDB('tournament_templates');
  }

  get_model_class() {
    return TournamentTemplate;
  }
}
