import Chance from 'chance';

import Global from '../framework/global';

const chance = new Chance();
const global = Global.instance();

export default class EventService {

  randomize(event) {
    let event_part_1 = ["MTG", "Catan", "Legendary", "Acension", "Dominion"];
    let event_part_2 = ["National", "Masters", "Regional"];
    let event_part_3 = ["Qualifier", "Finals", "Semi-Finals"];

    let locations = ["Spiel", "Gencon", "Dragoncon", "PAX East", "BGG.con", "BGF"];

    let game_name = chance.pickone(event_part_1);
    let event_name = `${game_name} ${chance.pickone(event_part_2)} ${chance.pickone(event_part_3)}`;

    let bool_types = [true, false];
    let rank_types = chance.shuffle(["WINS", "POINTS", "POINT_PCT"]);

    event._data = {
      _id: chance.guid(),
      game_name: game_name,
      event_name: event_name,
      location: chance.pickone(locations),
      date: chance.date({string: true}),
      organizer_id: global.user.get_id(),
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

  async create_from_template(event_template) {
    const event = new Event();

    event.create();
    event_template.to_unpublished_event(event);

    event.organizer = global.user;
    event.set('date', moment().format('L'));

    await event.save();
      
    let round_names = event_template.get('round_names');

    for(name of round_names) {
      let new_round = new Round();
      new_round.create();
      new_round.event = event;
      new_round.set('name', name);
      event.add_related_to_set('rounds', new_round);
      await new_round.save();

      console.log("Created new round");
      console.log(new_round);
    }

    await event.save();

    global.user.add_related_to_set('organized_events', event);
    await global.user.save();

    return event;
  }

  //checks for registration without needing to fetch related models
  is_player_registered(event, player) {
    return _.includes(event._data.player_ids, player.get_id());
  }

  get_rank_models(event) {
    return event.ranks.map( (r) => {
      let rm = r.to_view_model();
      rm.player_name = r.player.get('name');
      rm.player_id = r.player.get_id();
      rm.sum_score = _.sum(r.get('scores'));
      rm.sum_score_pcts = _.sum(r.get('score_pcts'));
      rm.sum_score_pcts = Math.round(rm.sum_score_pcts * 1000) / 1000;

      return rm;
    });
  }

  get_ordered_ranks() {
    return order_rank_models(event, get_rank_models(event));
  }

  order_rank_models(event, rank_models) {
    let first_rank = event.get('first_rank_by');
    let second_rank = event.get('second_rank_by');
    let third_rank = event.get('third_rank_by');

    let orders = ['dropped'];
    let rank_bys = [first_rank, second_rank, third_rank];

    for(let rb of rank_bys) {
      if(rb == "WINS")
        orders.push('num_wins');
      else if(rb == "POINTS")
        orders.push('sum_score');
      else if(rb == "POINT_PCT")
        orders.push('sum_score_pcts');
    }

    return _.orderBy(rank_models, orders, ['asc', 'desc', 'desc', 'desc', 'desc']);
  }

  async register_player(event, player) {
    console.log("Event::register_player Called");
    let new_rank = new Rank();

    new_rank.create();
    new_rank.event = event;
    new_rank.player = player;

    await event.update();

    event.add_related_to_set('players', player);
    event.add_related_to_set('ranks', new_rank);

    await event.save();
    await new_rank.save();
    await player.update();

    player.add_related_to_set('events', event);
    await player.save();
  }

  async remove_player(event, player) {
    let ranks = event.ranks.filter( (r) => r.get('player_id') === player.get_id());

    event.remove_related_reference('players', player.get_id());

    for(let r of ranks.models) {
      event.remove_related_reference('ranks', r.get_id());
    }

    await event.save();
    for(let r of ranks.models) {
      await r.destroy();
    }

    player.remove_related_from_set('events', event);
    await player.save();
  }

  remove_all_players(event) {
    event.remove_related_references('players', event.get('player_ids'));
    event.remove_related_references('ranks', event.get('rank_ids'));

    return event.save();
  }
}

