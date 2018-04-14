load('./mongo-helpers/period-aggregator.mongo.js'); // exports makeMapWith()

// notice: MongoDB will not call the reduce function for a key that has only a single value
const map = makeMapWith(renderDate, function mapTemplate() {
  // => emit same kind of output as reduce()'s
  emit(renderDate(this._id.getTimestamp()), {
    total: 1,
    iPhoneApp: this.iRf === 'iPhoneApp' ? 1 : 0
  });
});

function reduce(day, vals) {
  // notice: MongoDB can invoke the reduce function more than once for the same key
  var sum = (a, b) => a + b;
  return {
    total: vals.map(val => val.total).reduce(sum),
    iPhoneApp: vals.map(val => val.iPhoneApp).reduce(sum),
  };
}

var opts = {
  finalize: function(key, value) {
    return [ key, value.total || 0, value.iPhoneApp || 0 ];
  },
  out: { inline: 1 },
  //limit: 1000
};

var results = db.user.mapReduce(map, reduce, opts).results;
//print(results.map(res => [ res._id, res.value.total || 0, res.value.iPhoneApp || 0 ]).join('\n'));
