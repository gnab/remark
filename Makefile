all: deps test bundle

deps:
	npm install

test:
	./node_modules/.bin/mocha

bundle:
	node build/remark.js

.PHONY: deps test bundle
