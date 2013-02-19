all: deps bundle

deps:
	npm install && git submodule update --init --recursive

resources:
	node make resources

test:
	node make test

bundle:
	node make

.PHONY: deps test bundle
