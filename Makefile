all: deps
	node make all

deps:
	npm install

test:
	node make test

bundle:
	node make bundle

highlighter:
	node make highlighter

.PHONY: deps test bundle highlighter
