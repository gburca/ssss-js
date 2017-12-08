npm:
	npm install --no-optional

test: npm
	./node_modules/qunit/bin/qunit

html:
	git rev-parse --verify --short HEAD > version.txt
	./node_modules/browserify/bin/cmd.js ssss.js --standalone ssss -o bundle.js
	./node_modules/preprocessor/bin/preprocess template.html > ssss.html
	rm -f bundle.js
	rm -f version.txt

all: test html

.DEFAULT_GOAL := all
.PHONY: all test npm
