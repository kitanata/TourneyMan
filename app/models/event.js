'use strict';

import PouchDB from 'pouchdb';

import Model from '../framework/model';
import Collection from '../framework/collection';

import { User, Users } from './user';
import { Tournament } from './tournament';
import { Ranks } from './rank';
import { Rounds } from './round';
import { Tables } from './table';

export class Event extends Model {
  constructor(data) {
    super(data);

    this.organizer = null;
    this.tournament = null;
    this.next_event = null;
    this.players = null;
    this.rounds = null;
    this.ranks = null;
  }

  init_data() {
    return {
      _id: "",
      organizer_id: "",
      tournament_id: "",
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
        'tournament': Tournament,
        'next_event': Event
      },
      'has_many': {
        'players': Users,
        'rounds': Rounds,
        'ranks': Ranks
      },
      'as_referenced_by': [
        ['event', Ranks],
        ['event', Rounds],
        ['event', Tables]
      ]
    }
  }
}

export class Events extends Collection {

  get_database() {
    return new PouchDB('events');
  }

  get_model_class() {
    return Event;
  }
}
