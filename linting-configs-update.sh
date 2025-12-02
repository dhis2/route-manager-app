#!/usr/bin/env bash
yarn add -D eslint
yarn add -D prettier
yarn add -D husky
yarn add -D lint-staged

yarn add -D @dhis2/config-eslint
yarn add -D @dhis2/config-prettier

npx husky init

echo "yarn lint-staged" > .husky/pre-commit

rm .prettierrc.js
echo "import prettierConfig from '@dhis2/config-prettier'\n\n/**\n * @type {import(\"prettier\").Config}\n */\nconst config = {\n    ...prettierConfig,\n}\n\nexport default config" > ./.prettierrc.mjs

rm .eslintrc.js
echo "import config from '@dhis2/config-eslint'\nimport { defineConfig } from 'eslint/config'\n\nexport default defineConfig([\n    {\n        extends: [config],\n    },\n])" > ./eslint.config.mjs

npm pkg set 'scripts.prepare'='husky'

npm pkg set 'scripts.lint'='yarn tsc && eslint && prettier -c .'
npm pkg set 'lint-staged.*'='["yarn prettier . --write","yarn lint"]' --json

yarn prettier . --write