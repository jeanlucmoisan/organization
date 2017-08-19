'use strict'

const env = require('./env');
const arango = require('arangojs');

const db = new arango.Database({
	url: `http://${env.DATABASE_USERNAME}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}`,
	databaseName: env.DATABASE_NAME
});

console.log('using db '+env.DATABASE_NAME+' with url '+"http://"+env.DATABASE_USERNAME+":"+env.DATABASE_PASSWORD+"@"+env.DATABASE_HOST+":"+env.DATABASE_PORT);

module.exports = db;