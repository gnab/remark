all: deps test bundle

deps:
	npm install && git submodule init && git submodule update

test:
	./node_modules/.bin/mocha

bundle:
	node build/remark.js

.PHONY: deps test bundle
