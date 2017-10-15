'use strict';
var bn = require('bignumber.js');

var mpz = function() {};

/**
 * Return the size of op measured in number of digits in the given base. base
 * can vary from 2 to 62. The sign of op is ignored, just the absolute value is
 * used. The result will be either exact or 1 too big. If base is a power of 2,
 * the result is always exact. If op is zero the return value is always 1.
 *
 * This function can be used to determine the space required when converting op
 * to a string. The right amount of allocation is normally two more than the
 * value returned by mpz_sizeinbase, one extra for a minus sign and one for the
 * null-terminator. */
mpz.prototype.sizeinbase = function(v, b) {
    return (new bn(v)).abs().toString(b).length;
}

mpz.prototype.sizeinbits = function(v) {
    var n = new bn(v);
    return n.eq(0) ? 0 : this.sizeinbase(n, 2);
}

/** Compare op1 and op2. Return a positive value if op1 > op2, zero if op1 =
 * op2, or a negative value if op1 < op2. */
mpz.prototype.cmp_ui = function(v, i) {
    return (new bn(v)).cmp(new bn(i));
}

/** Return a new BigNumber whose value is 'v * 2^bitCount'. This operation
 * can also be defined as a left shift by bitCnt bits. */
mpz.prototype.lshift = mpz.prototype.mul_2exp = function(v, bitCnt) {
    v = new bn(v);
    var two = new bn(2);
    return v.times(two.pow(bitCnt));
}

/** Swap 2 values:
 * a = mpz.swap(b, b=a);
 */
mpz.prototype.swap = function(x) {
    return x;
}

/** Returns a new BigNumber that "looks" like a 2's complement of the given
 * number. Non-negative numbers are returned unchanged. For negative inputs,
 * when the returned value is converted to binary using toString(2), and the
 * most-significant "1" is sign extended to the desired number of bits, the
 * value will be a proper 2's complement representation of the input value.
 * Negative values will retain the negative sign. 
 *
 * For example:
 *  -1 => -1
 *  -2 => -10
 *  -3 => -101
 *  -6 => -1010
 *  */
mpz.prototype.two_compl = function(v) {
    v = new bn(v);

    if (!v.isNegative()) { return v; }
    if (v.equals(-1)) { return v; } // Otherwise we return -11

    var min1 = v.abs().minus(1);
    var inv = min1.toString(2).split("").map(function(v) {
        return v === "0" ? "1" : "0";
    });
    return new bn("-1" + inv.join(""), 2);
}

/** Test bit bit_index in op and return 0 or 1 accordingly. Assumes 2's
 * complement representation. */
mpz.prototype.tstbit = function(v, bitIdx) {
    if (bitIdx < 0) { throw "Negative bit index"; }
    v = this.two_compl(v);
    var bits = v.abs().toString(2);

    if (bitIdx >= bits.length) {
        // negative values are sign-extended
        return v.isNegative() ? 1 : 0;
    }

    // Instead of reversing the string/bits, reverse the index
    bitIdx = (bits.length - 1) - bitIdx;
    return bits.charAt(bitIdx) === "0" ? 0 : 1;
}

/** Returns a new BigNumber created by calling fn() with pairs of bits from a
 * and b (starting with bit-0) and setting the corresponding bit in the new
 * number to the value returned by fn() which must be a "0" or "1". If one of
 * the numbers has fewer bits than the other, the shorter number is extended
 * with 0's (or 1's if it's a negative number) to match the length of the
 * longer one. */
mpz.prototype.bin_map = function(a, b, fn) {
    a = this.two_compl(a);
    b = this.two_compl(b);
    var sa = a.abs().toString(2).replace("-", "").split("").reverse();
    var sb = b.abs().toString(2).replace("-", "").split("").reverse();

    // Swap so sa is the longest
    if (sa.length < sb.length) {
        var st = sa; var t = a;
        sa = sb; a = b;
        sb = st; b = t;
    }

    var signExt = b.isNegative() ? "1" : "0";
    var res = sa.map(function(v, idx) {
        if (idx < sb.length) {
            return fn(v, sb[idx]);
        } else {
            return fn(v, signExt);
        }
    });
    return new bn(res.reverse().join(""), 2);
}

/** Returns the bitwise or of the arguments. Assumes 2's complement
 * representation. */
mpz.prototype.or = function(a, b) {
    return this.bin_map(a, b, function(va, vb) {
        return va === "1" || vb === "1" ? "1" : "0";
    });
}

/** Returns the bitwise exclusive-or of the arguments. Assumes 2's complement
 * representation. */
mpz.prototype.xor = function(a, b) {
    return this.bin_map(a, b, function(va, vb) {
        return va === vb ? "0" : "1";
    });
}

/** Sets the specified bit. */
mpz.prototype.setbit = function(v, bitIdx) {
    if (bitIdx < 0) { throw "Negative bit index"; }
    v = new bn(v);
    var res = this.or(v, (new bn(2)).pow(bitIdx));
    return v.isNegative() ? res.negated() : res;
}

mpz.prototype.set_str = function(s, base) {
    var big = new bn(s, base);
    return big;
}

/** Fills the given array with random unsigned integer numbers. */
mpz.prototype.randIntArray = function(arr) {
  var max = this.mul_2exp(1, arr.BYTES_PER_ELEMENT * 8).minus(1);
  arr.forEach(function(val, idx, a) {
    a[idx] = max.times(bn.random()).truncated().toNumber();
  });
}

mpz.prototype.ORDER_MSB = true;  // +1 in GMP
mpz.prototype.ORDER_LSB = false; // -1 in GMP
mpz.prototype.ENDIAN_MSB = 1;
mpz.prototype.ENDIAN_LSB = -1;
mpz.prototype.ENDIAN_HOST = 0; // Not supported

/** Returns a BigNumber created from buf.
 *
 * The parameters specify the format of the data. Order can be ORDER_MSB for
 * most significant byte/word first or ORDER_LSB for least significant first in
 * the buffer. Within each word in the buffer, endian can be ENDIAN_MSB for
 * most significant byte first, ENDIAN_LSB for least significant first, or
 * ENDIAN_HOST for the native endianness of the host CPU.
 *
 * There is no sign taken from the data, the output will simply be a positive
 * integer.  An application can handle any sign itself.
*/
mpz.prototype.import = function(orderMSB, endian, buf) { if (typeof buf ===
    'string') { var s = new Uint8Array(buf.length); s.forEach(function(v, i, s)
      { s[i] = buf.charCodeAt(i); }); buf = s; }

    if (buf.BYTES_PER_ELEMENT > 2) throw "Wrong type";

    // Put least significant word in buf[0]
    if (orderMSB === mpz.prototype.ORDER_MSB) {
        // Need to make a copy b/c reverse() modifies the input
        if (buf.BYTES_PER_ELEMENT == 1) {
            buf = new Uint8Array(buf);
        } else {
            buf = new Uint16Array(buf);
        }
        buf.reverse();
    }
    var power = new bn(8);

    var res = new bn(0);
    if (buf.BYTES_PER_ELEMENT == 1) {
        buf.forEach(function(elem, idx) {
            res = res.plus( this.mul_2exp(elem, power.times(idx)) );
        }, this);
    } else if (buf.BYTES_PER_ELEMENT == 2) {
        var view = new DataView(buf.buffer);
        var littleEndian = (endian === mpz.prototype.ENDIAN_LSB);

        for (var i = 0; i < view.byteLength; i = i + 2) {
            var v = view.getUint16(i, littleEndian);
            res = res.plus( this.mul_2exp(v, power.times(i)) );
        }
    }
    return res;
}


/** Returns a byte array with the contents of BigNumber.
 * @param {Boolean} orderMSB
 */
mpz.prototype.export = function(orderMSB, size, endian, val) {
    val = val.abs();

    var res;
    var a = [];

    if (size === 1) {
        var div = Math.pow(2, 8);
        while (!val.isZero()) {
            a.push(val.mod(div).toNumber());
            val = val.dividedToIntegerBy(div);
        }
    } else {
        var word = Math.pow(2, 16);
        while (!val.isZero()) {
            var w = val.mod(word);
            a.push(w.toNumber());
            val = val.dividedToIntegerBy(word);
        }

        if (endian === mpz.prototype.ENDIAN_MSB) {
            a.forEach(function(val, idx, arr) {
                arr[idx] = (val >>> 8) | ((val & 0x00ff) << 8);
            });
        }
    }

    if (orderMSB === 1 || orderMSB === true) {
        a.reverse();
    }

    if (size === 1) {
        return Uint8Array.from(a);
    } else {
        return Uint16Array.from(a);
    }
}

module.exports = new mpz();
