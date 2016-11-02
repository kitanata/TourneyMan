'use strict';

rivets.formatters.filter = function(value, property, match) {
  if(match === "") return value;

  let search_on = _.map(value, (x) => x[property]);

  let results = fuzzy.filter(match, search_on).map((x) => x.original);

  return _.filter(value, (x) => _.includes(results, x[property]));
}

rivets.formatters.truncate = function(value, amount) {
  return value.substr(0, amount);
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

/*
 * Because rivets doesn't have one and using attr with jquery is evil
 */
rivets.binders["data-id"] = function(el, value) {
  $(el).data('id', value);
}

rivets.binders["data-idx"] = function(el, value) {
  $(el).data('idx', value);
}
