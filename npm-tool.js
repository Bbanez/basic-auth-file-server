const { createFS } = require('@banez/fs');
const { createConfig } = require('@banez/npm-tool');

const fs = createFS({
  base: process.cwd(),
});

module.exports = createConfig({});
