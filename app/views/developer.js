'use strict';

class DeveloperView extends BaseView {

  constructor() {
    super();

    this.title = "Developer Menu";
    this.template = "developer";

    this.user_set = null;
    this.event_set = null;
    this.event_template_set = null;
    this.tournament_set = null;
    this.tournament_template_set = null;
    this.round_set = null;
    this.rank_set = null;
    this.seat_set = null;
    this.table_set = null;

    this.model = {
      db_counts: [],
      node_version: process.versions.node,
      chrome_version: process.versions.chrome,
      electron_version: process.versions.electron,
      download_link: "",
      download_ready: false
    }

    this.events = {
      "click": {
        ".event_list": () => router.navigate("event_list"),
        ".my_profile": () => this.onMyProfileClicked(),
        ".user_list": () => router.navigate("list_users"),
        ".logout": () => {
          window.user = null;
          router.navigate("login");
        },
        ".on-close": () => {
          router.navigate("back");
        },
        ".drop-db": (el) => this.onDropDatabaseClicked(el),
        ".clear_database": (el) => this.onClearDatabaseClicked(el),
        ".generate_data": (el) => this.onGenDataClicked(el),
        ".bootstrap": (el) => this.onBootstrapClicked(el),
        ".export-json": (el) => this.onExportDataClicked(el),
      }
    }
  }

  pre_render() {
    if(!window.user.is_developer()) return;

    router.menu_view.set_active_menu('admin');

    this.user_set = new Users();
    this.event_set = new Events();
    this.event_template_set = new EventTemplates();
    this.tournament_set = new Tournaments();
    this.tournament_template_set = new TournamentTemplates();
    this.round_set = new Rounds();
    this.rank_set = new Ranks();
    this.seat_set = new Seats();
    this.table_set = new Tables();

    this.user_set.all()
      .then( () => {
        return this.event_set.all();
      })
      .then( () => {
        return this.event_template_set.all();
      })
      .then( () => {
        return this.tournament_set.all();
      })
      .then( () => {
        return this.tournament_template_set.all();
      })
      .then( () => {
        return this.round_set.all();
      })
      .then( () => {
        return this.rank_set.all();
      })
      .then( () => {
        return this.seat_set.all();
      })
      .then( () => {
        return this.table_set.all();
      })
      .then( () => {
        this.update_model();
        this.rebind_events();
      })
  }

  update_model() {
    this.model.dbs = [
      {
        'name': 'Users',
        'set_name': 'user_set',
        'count': this.user_set.count()
      }, {
        'name': 'Events',
        'set_name': 'event_set',
        'count': this.event_set.count()
      }, {
        'name': 'EventTemplates',
        'set_name': 'event_template_set',
        'count': this.event_template_set.count()
      }, {
        'name': 'Tournaments',
        'set_name': 'tournament_set',
        'count': this.tournament_set.count()
      }, {
        'name': 'TournamentTemplates',
        'set_name': 'tournament_template_set',
        'count': this.tournament_template_set.count()
      }, {
        'name': 'Rounds',
        'set_name': 'round_set',
        'count': this.round_set.count()
      }, {
        'name': 'Ranks',
        'set_name': 'rank_set',
        'count': this.rank_set.count()
      }, {
        'name': 'Seats',
        'set_name': 'seat_set',
        'count': this.seat_set.count()
      }, {
        'name': 'Tables',
        'set_name': 'table_set',
        'count': this.table_set.count()
      }
    ];
  }

  onDropDatabaseClicked(el) {
    if(!window.user.is_developer()) return;

    let set_name = $(el.currentTarget).data('id');

    this[set_name].destroy().then( () => {
      this.update_model();
      this.rebind_events();
    });
  }

  onGenDataClicked(el) {
    if(!window.user.is_developer()) return;

    console.log("Generating Users");
    for(let i=0; i < this.model.num_users; i++) {
      let new_user = new User();
      new_user.randomize(); //saves them by using register function.
    }

    console.log("Generating Events");
    for(let i=0; i < this.model.num_events; i++) {
      let new_event = new Event();
      new_event.randomize();
      new_event.save();
    }

    let events = new Events();
    let users = new Users();

    let p = events.all()
      .then( () => {
        return users.all();
      })

    console.log("Generating Players");
    for(let i=0; i < this.model.num_players; i++) {
      p = p.then(() => {
        return this.generate_player(users, events);
      });
    }

    p.then( () => {
      console.log("Finished Creating Players!");
    });
  }

  generate_player(users, events) {
    var user = chance.pickone(users.models);
    var event = chance.pickone(events.models);

    return event.register_player(user);
  }

  onBootstrapClicked(el) {
    let p = Promise.resolve();

    let local_qualifier = new EventTemplate()
    let finals = new EventTemplate()

    local_qualifier.create()
    local_qualifier.organizer = user;

    local_qualifier.from_view_model({
      'event_name': "Catan Local Qualifier Event",
      'game_name': "Catan",
      'buy_player_score_by_average': true,
      'round_names': ["Round 1", "Round 2", "Round 3"]
    });

    finals.create()
    finals.organizer = user;
    finals.from_view_model({
      'event_name': "Catan Finals Event",
      'game_name': "Catan",
      'buy_player_score_by_average': true,
      'round_names': ["Round 1", "Round 2", "Round 3"]
    });

    p.then( () => {
      return local_qualifier.save();
    }).then( () => {
      return finals.save()
    }).then( () => {
      window.user.add_related_to_set('event_templates', local_qualifier);
      window.user.add_related_to_set('event_templates', finals);
      return window.user.save();
    }).then( () => {
      let catan = new TournamentTemplate()
      catan.create()
      catan.organizer = user;
      catan.from_view_model({
        'name': "Catan Tournament",
        'event_templates': [{
          'event_template_name': local_qualifier.get('event_name'),
          'event_template_id': local_qualifier.get_id(),
          'previous_event_ids': [],
          'next_event_id': finals.get_id()
        }, {
          'event_template_name': finals.get('event_name'),
          'event_template_id': finals.get_id(),
          'previous_event_ids': [local_qualifier.get_id()],
          'next_event_id': null,
        }]
      });
      return catan.save()
    }).then( () => {
      alert("DONE!");
    });
  }

  onExportDataClicked(el) {
    let export_data = {}

    for(let model_set of this.model.dbs) {
      export_data[model_set['name']] = this[model_set['set_name']].to_view_models();
    }

    let data = "text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(export_data));

    this.model.download_link = "data:" + data;
    this.model.download_ready = true;
  }
}
