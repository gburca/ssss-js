[![npm package](https://nodei.co/npm/ssss-js.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ssss-js/)

[![Build Status](https://travis-ci.org/gburca/ssss-js.svg?branch=master)](https://travis-ci.org/gburca/ssss-js)


This project is a JavaScript version of [Shamir's Secret Sharing
Scheme](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing). It has 2
distinguishing features:

1. It is interoperable and compatible with B. Poettering's Linux `ssss` utility
   (`ssss-split` and `ssss-combine`) from http://point-at-infinity.org/ssss/ so
   keys/shares can be created with one and recovered with the other. That
   project was used as the reference implementation for this project.
2. It consists of a single `html` file which includes everything needed to
   split and combine a secret (no network connection needed). As a result it is
   fully usable from Windows, Mac OSX, Linux, and other operating systems with
   a modern browser.

There are some other implementations of Shamir's Secret Sharing Scheme (SSSS)
floating around, but none seem to be compatible with each other. The Linux
utility is great (which is why this project is compatible with it), but chances
are the people you want to share the secret with are not running Linux.

The author of the Linux utility maintains a web page where the utility can be
demo'd, but the author notes that it's not secure and should not be used for
sensitive data.

The [ssss.html](https://ebixio.com/ssss.html) file generated by this project
has no server dependencies (or any other external dependencies) and is as
secure as the browser or PC it's being used on. Additionally, it eliminates the
need to rely on a 3rd party web site page that may or may not be available in
the future.

Usage
=====
- Try it out at https://ebixio.com/ssss.html
- For offline use:
  - Download `ssss.html` from https://ebixio.com/ssss.html or https://github.com/gburca/ssss-js/releases
  - Open up the downloaded page with a browser and follow the simple instructions.

Build
=====
- A simple `Makefile` is provided to assist with generating the stand-alone
  `html` page.
- `npm` package is at: https://www.npmjs.com/package/ssss-js

Test
====
- Since all the tests are in `test/*`:
```
    ./node_modules/qunitjs/bin/qunit
```
OR (during development) if you have `entr`:
```
    ls *.js test/*.js | entr -c ./node_modules/qunitjs/bin/qunit
```
