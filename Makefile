install:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	NODE_OPTIONS=--experimental-vm-modules npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

.PHONY: test