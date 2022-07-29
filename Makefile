all: deps
	node make all

deps:
	npm ci

test:
	node make test

bundle:
	node make bundle

highlighter:
	node make highlighter

.PHONY: deps test bundle highlighter
