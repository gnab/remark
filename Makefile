all: deps bundle

deps:
	npm install && git submodule update --init --recursive

resources:
	node make resources

bundle:
	node make

.PHONY: deps bundle
