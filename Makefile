all: deps test bundle

deps:
	npm install && git submodule init && git submodule update

test:
	find test -name *_test.js | xargs ./node_modules/.bin/mocha $(OPTS)

autotest:
	make test OPTS=-w

bundle:
	node build/remark.js

.PHONY: deps test autotest bundle
