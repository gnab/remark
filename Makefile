all: test bundle

test:
	./node_modules/.bin/mocha

bundle:
	node bundle.js

.PHONY: test
.PHONY: bundle
