'use strict';

rivets.formatters.filter = function(value, property, match) {
  if(match === "") return value;

  let search_on = _.map(value, (x) => x[property]);

  let results = fuzzy.filter(match, search_on).map((x) => x.original);

  return _.filter(value, (x) => _.includes(results, x[property]));
}

rivets.formatters.truncate = function(str, amount) {
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

rivets.formatters.date = function(value) {
  return moment(value).format("L");
}

rivets.formatters.length = function(value) {
  return value.length;
}

rivets.formatters.position = function(value) {
  if(value == 0)
    return "First";

  if(value == 1)
    return "Second";

  if(value == 2)
    return "Third";

  if(value == 3)
    return "Fourth";
}

rivets.formatters.rank_desc = function(value) {
  if(value == "WINS")
    return "the number of wins";
  else if(value == "POINTS")
    return "the total number of points";
  else
    return "the percentage of points gained each round";
}

rivets.formatters.rank_desc_short = function(value) {
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
rivets.binders["data-id"] = function(el, value) {
  $(el).data('id', value);
}

rivets.binders["data-idx"] = function(el, value) {
  $(el).data('idx', value);
}
