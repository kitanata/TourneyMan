'use strict';

rivets.formatters.filter = function(value, property, match) {
  if(match === "") return value;

  let search_on = _.map(value, (x) => x[property]);

  let results = fuzzy.filter(match, search_on).map((x) => x.original);

  return _.filter(value, (x) => _.includes(results, x[property]));
}

/*
 * Because rivets doesn't have one and using attr with jquery is evil
 */
rivets.binders["data-id"] = function(el, value) {
  $(el).data('id', value);
}
