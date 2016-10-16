'use strict';

rivets.formatters.filter = function(value, property, match) {
  if(match === "") return value;

  let search_on = _.map(value, (x) => x[property]);

  let results = fuzzy.filter(match, search_on).map((x) => x.original);

  return _.filter(value, (x) => _.includes(results, x[property]));
}
