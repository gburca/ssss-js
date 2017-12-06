npm:
	npm install

test: npm
	./node_modules/qunit/bin/qunit

all: test
	./node_modules/browserify/bin/cmd.js ssss.js --standalone ssss -o bundle.js
	./node_modules/preprocessor/bin/preprocess template.html > ssss.html
	rm -f bundle.js

.DEFAULT_GOAL := all
.PHONY: all test npm
