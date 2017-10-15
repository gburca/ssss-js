////////////////////////////////////////////////////////////////////////////////
// Uses https://github.com/MikeMcl/bignumber.js

var bn = require('bignumber.js');
var mpz = require('../mpz.js');

function log(msg) { console.log(msg); }

QUnit.test("sizeinbase", function(assert) {
    assert.equal(mpz.sizeinbase(0, 2), 1, "positive binary");
    assert.equal(mpz.sizeinbase(5, 2), 3, "positive binary");
    assert.equal(mpz.sizeinbase(-5, 2), 3, "negative binary");
    assert.equal(mpz.sizeinbase(15, 16), 1, "Single hex");
    assert.equal(mpz.sizeinbase(-15, 16), 1, "Single hex");
    assert.equal(mpz.sizeinbase(16, 16), 2, "Single hex");
});

QUnit.test("sizeinbits", function(assert) {
    assert.equal(mpz.sizeinbits(0), 0);
    assert.equal(mpz.sizeinbits(1), 1);
});

QUnit.test("cmp_ui", function(assert) {
    assert.equal(mpz.cmp_ui(2, 1), 1);
    assert.equal(mpz.cmp_ui(1, 2), -1);
    assert.equal(mpz.cmp_ui(2, 2), 0);
});

QUnit.test("mul_2exp", function(assert) {
    assert.ok(mpz.mul_2exp(7, 3).equals( new bn(7 * (2*2*2)) ));
    assert.ok(mpz.lshift  (7, 3).equals( new bn(7 * (2*2*2)) ));
    assert.ok(mpz.mul_2exp(7, 3).equals( new bn(7 * (2*2*2)) ));
});

QUnit.test("swap", function(assert) {
    var a = 1;
    var b = 2;
    a = mpz.swap(b, b=a);
    assert.equal(a, 2);
    assert.equal(b, 1);
});

QUnit.test("two_compl", function(assert) {
    assert.equal( mpz.two_compl(0).toString(2), "0" );
    assert.equal( mpz.two_compl(10).toString(2), "1010" );
    assert.equal( mpz.two_compl(-1).toString(2), "-1" );
    assert.equal( mpz.two_compl(-2).toString(2), "-10" );
    assert.equal( mpz.two_compl(-6).toString(2), "-1010" );
    assert.equal( mpz.two_compl(-9).toString(2), "-10111" );
    assert.equal( mpz.two_compl(-10).toString(2), "-10110" );
});

QUnit.test("tstbit", function(assert) {
    assert.equal(mpz.tstbit(0, 10), 0);

    assert.equal(mpz.tstbit(4, 0), 0);
    assert.equal(mpz.tstbit(4, 1), 0);
    assert.equal(mpz.tstbit(4, 2), 1);

    assert.equal(mpz.tstbit(-1, 10), 1);
    // -9 => ....110111, 9 => 001001
    assert.equal(mpz.tstbit(-9, 2), 1);
    assert.equal(mpz.tstbit(-9, 3), 0);
});

QUnit.test("or", function(assert) {
    assert.ok( mpz.or(0, 0).equals(0) );
    assert.ok( mpz.or(1, 2).equals(3) );
    assert.ok( mpz.or(2, 1).equals(3) );
    assert.ok( mpz.or(0, 5).equals(5) );

    //  11 = ...01011
    // -11 = ...10101
    //   3 = ...00011
    //          10111 = -11 | 3 = 23
    //          01011 =  11 | 3 = 11
    assert.ok( mpz.or(-11, 3).equals(23) );
});

QUnit.test("xor", function(assert) {
    assert.ok( mpz.xor(0, 0).equals(0) );
    assert.ok( mpz.xor(0, 1).equals(1) );
    assert.ok( mpz.xor(1, 0).equals(1) );
    assert.ok( mpz.xor(1, 1).equals(0) );

    function f(a, b, exp) {
        a = new bn(a, 2);
        b = new bn(b, 2);
        exp = new bn(exp, 2);
        return mpz.xor(a, b).equals(exp) && mpz.xor(b, a).equals(exp);
    }

    assert.ok( f( "1010",  "1100",  "0110") );

    assert.ok( f( "1010",
                 "11100",
                 "10110") );

    assert.ok( f("11010",
                  "-100",   // = -4 = ...1100 in 2's
                   "110") );

    assert.ok( f(  "-110",  // = -6 = ..11010 in 2;s
                   "-100",  // = -4 = ...1100 in 2's
                    "110") );

    assert.ok( mpz.xor(new bn("101", 2), 0).equals(5) );
});

QUnit.test("setbit", function(assert) {
    assert.ok( mpz.setbit(0, 0).equals(1) );
    assert.ok( mpz.setbit(1, 0).equals(1) );
    assert.ok( mpz.setbit(2, 0).equals(3) );
    assert.ok( mpz.setbit(0, 2).equals(4) );

    // Not intuitive at all. -4 is -100 in 2's. When we set bit-1 we get -110
    // which is -6 in sign-magnitude notation.
    assert.ok( mpz.setbit(-4, 1).equals(-6) );
});

QUnit.test("import", function(assert) {
    var count = 0;
    var size = 1;
    var expected = new bn("12345678", 16);
    var imported;

    // Try orderMSB and LSB
    imported = mpz.import(mpz.ORDER_MSB, mpz.ENDIAN_MSB,
                new Uint8Array([0x12, 0x34, 0x56, 0x78]));
    assert.ok( imported.equals(expected) );
    imported = mpz.import(mpz.ORDER_LSB, mpz.ENDIAN_MSB,
                new Uint8Array([0x78, 0x56, 0x34, 0x12]));
    assert.ok( imported.equals(expected) );

    // Ensure endian makes no difference for uint8 arrays
    imported = mpz.import(mpz.ORDER_MSB, mpz.ENDIAN_LSB,
                new Uint8Array([0x12, 0x34, 0x56, 0x78]));
    assert.ok( imported.equals(expected) );
    imported = mpz.import(mpz.ORDER_LSB, mpz.ENDIAN_LSB,
                new Uint8Array([0x78, 0x56, 0x34, 0x12]));
    assert.ok( imported.equals(expected) );


    // The goad of each import is to get to 0x12345678
    imported = mpz.import(mpz.ORDER_MSB, mpz.ENDIAN_MSB,
            new Uint16Array([0x3412, 0x7856]));
    assert.ok( imported.equals(expected) );
    imported = mpz.import(mpz.ORDER_LSB, mpz.ENDIAN_MSB,
            new Uint16Array([0x7856, 0x3412]));
    assert.ok( imported.equals(expected) );
    imported = mpz.import(mpz.ORDER_MSB, mpz.ENDIAN_LSB,
            new Uint16Array([0x1234, 0x5678]));
    assert.ok( imported.equals(expected) );
    imported = mpz.import(mpz.ORDER_LSB, mpz.ENDIAN_LSB,
            new Uint16Array([0x5678, 0x1234]));
    assert.ok( imported.equals(expected) );

    var buf = "abcdef";
    imported = mpz.import(mpz.ORDER_MSB, mpz.ENDIAN_HOST, buf);
    assert.equal(imported.toString(), "107075202213222");
});

QUnit.test("export", function(assert) {
    var bigVal1 = new bn("12345678", 16);

    var exp, act;

    exp = Uint8Array.from([0x12, 0x34, 0x56, 0x78]);
    act = mpz.export(mpz.ORDER_MSB, 1, mpz.ENDIAN_MSB, bigVal1);
    assert.deepEqual(act, exp);

    exp.reverse();
    act = mpz.export(mpz.ORDER_LSB, 1, mpz.ENDIAN_MSB, bigVal1);
    assert.deepEqual(act, exp);


    exp = Uint16Array.from([0x3412, 0x7856]);
    act = mpz.export(mpz.ORDER_MSB, 2, mpz.ENDIAN_MSB, bigVal1);
    assert.deepEqual(act, exp);

    exp.reverse();
    act = mpz.export(mpz.ORDER_LSB, 2, mpz.ENDIAN_MSB, bigVal1);
    assert.deepEqual(act, exp);

    exp = Uint16Array.from([0x1234, 0x5678]);
    act = mpz.export(mpz.ORDER_MSB, 2, mpz.ENDIAN_LSB, bigVal1);
    assert.deepEqual(act, exp);

    var bigVal2 = new bn(  "123456", 16);

    exp = Uint16Array.from([0x1200, 0x5634]);
    act = mpz.export(mpz.ORDER_MSB, 2, mpz.ENDIAN_MSB, bigVal2);
    assert.deepEqual(act, exp);
});

