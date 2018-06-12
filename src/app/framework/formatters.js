'use strict';

import $ from 'jquery';
import fuzzy from 'fuzzy';
import moment from 'moment';

export default class RivetsFormatters {
  constructor(rivets) {
    this.rivets = rivets;
  }

  setup() {
    this.rivets.formatters.filter = function(value, property, match) {
      if(match === "") return value;

      let search_on = _.map(value, (x) => x[property]);

      let results = fuzzy.filter(match, search_on).map((x) => x.original);

      return _.filter(value, (x) => _.includes(results, x[property]));
    }

    this.rivets.formatters.truncate = function(str, amount) {
      let result = "";

      if(str === undefined)
        return "";

      let words = str.split(' ');

      let len = 0;
      for(let w of words) {
        len += w.length;

        if(len > amount && result == "") {
          result = value.substr(0, amount);
          result += "..."
        } else if(len < amount) {
          result += w + " ";
        } else {
          result += "...";
          break;
        }
      }

      return result;
    }

    this.rivets.formatters.date = function(value) {
      return moment(value).format("L");
    }

    this.rivets.formatters.length = function(value) {
      return value.length;
    }

    this.rivets.formatters.position = function(value) {
      if(value == 0)
        return "First";

      if(value == 1)
        return "Second";

      if(value == 2)
        return "Third";

      if(value == 3)
        return "Fourth";
    }

    this.rivets.formatters.rank_desc = function(value) {
      if(value == "WINS")
        return "the number of wins";
      else if(value == "POINTS")
        return "the total number of points";
      else
        return "the percentage of points gained each round";
    }

    this.rivets.formatters.rank_desc_short = function(value) {
      if(value == "WINS")
        return "Wins Total"
      else if(value == "POINTS")
        return "Point Total"
      else
        return "Point %"
    }

    /*
    * Because rivets doesn't have one and using attr with jquery is evil
    */
    this.rivets.binders["data-id"] = function(el, value) {
      $(el).data('id', value);
    }

    this.rivets.binders["data-idx"] = function(el, value) {
      $(el).data('idx', value);
    }
  }
}

