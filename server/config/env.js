'use strict';

const env = {
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL || '192.168.99.100',
  DATABASE_NAME: process.env.DATABASE_NAME || 'organization',
  DATABASE_HOST: process.env.DATABASE_HOST || '192.168.99.100',
  DATABASE_USERNAME: process.env.DATABASE_USERNAME || 'jeanluc',
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || 'jeanluc',
  DATABASE_PORT: process.env.DATABASE_PORT || 8529,
  DATABASE_DIALECT: process.env.DATABASE_DIALECT || '',

  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = env;