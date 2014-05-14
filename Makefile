all: deps
	node make all

deps:
	npm install

test:
	node make test

bundle:
	node make bundle

highlightjs:
	rm -rf vendor/highlight.js && \
	  mkdir -p vendor && cd vendor && \
	  git clone https://github.com/isagalaev/highlight.js.git && \
	  cd highlight.js && \
	  git checkout tags/8.0

highlighter: highlightjs
	node make highlighter

.PHONY: deps test bundle highlighter
