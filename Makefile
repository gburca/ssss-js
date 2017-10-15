all: test
	./node_modules/browserify/bin/cmd.js ssss.js --standalone ssss -o bundle.js
	./node_modules/preprocessor/bin/preprocess template.html > ssss.html
	rm -f bundle.js

test:
	./node_modules/qunitjs/bin/qunit

.PHONY: all test
