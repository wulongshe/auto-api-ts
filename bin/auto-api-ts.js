#!/usr/bin/env node

const dotenv = require('dotenv');

const { build } = require('../dist/index.js');

dotenv.config();

build(process.env);

