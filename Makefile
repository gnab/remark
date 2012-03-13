all: test bundle

test:
	./node_modules/.bin/mocha

bundle:
	node build/remark.js

.PHONY: test
.PHONY: bundle
