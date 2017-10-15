var ssss = require('../ssss.js');

QUnit.test("encode decode short", function(assert) {
  var threshold = 4, numKeys = 6;
  var foo = new ssss(threshold, numKeys);
  var secretIn = "abcdefgh";
  var keys = foo.split(secretIn, "tkn");
  console.log(keys);
  var secretOut = foo.combine(keys.slice(0, threshold));
  console.log("Combined using same obj: " + secretOut);
  assert.equal(secretOut, secretIn);

  // Single argument ctor (only for combining)
  var foo2 = new ssss(threshold);
  secretOut = foo2.combine(keys.slice(0, threshold));
  console.log("Combined using new obj: " + secretOut);
  assert.equal(secretOut, secretIn);
});

QUnit.test("encode decode long", function(assert) {
  var threshold = 4, numKeys = 6;
  var foo = new ssss(threshold, numKeys);
  //var secretIn = "abcdefghiáñòâé";
  var secretIn = "abcdefghijklmnopqrstuvwxyz";
  var keys = foo.split(secretIn, "tkn");
  console.log(keys);
  var secretOut = foo.combine(keys.slice(0, threshold));
  console.log("Combined using same obj: " + secretOut);
  assert.equal(secretOut, secretIn);

  // Single argument ctor (only for combining)
  var foo2 = new ssss(threshold);
  secretOut = foo2.combine(keys.slice(0, threshold));
  console.log("Combined using new obj: " + secretOut);
  assert.equal(secretOut, secretIn);
});


QUnit.test("encode decode hex", function(assert) {
  var threshold = 3, numKeys = 6, inputIsHex = true;
  var foo = new ssss(threshold, numKeys, inputIsHex);

  //var secretIn = "7bcd123411223344";
  var secretIn = "abcd0123";
  var keys = foo.split(secretIn, "foo");
  //console.log(keys);
  var secretOut = foo.combine(keys.slice(0, threshold));
  //console.log("Combined using same obj: " + secretOut);
  assert.equal(secretOut, secretIn);

  // Single argument ctor (only for combining)
  var foo2 = new ssss(threshold, numKeys, inputIsHex);
  secretOut = foo2.combine(keys.slice(0, threshold));
  //console.log("Combined using new obj: " + secretOut);
  assert.equal(secretOut, secretIn);
});

