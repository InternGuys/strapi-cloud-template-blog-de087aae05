'use strict';

const schema = require('./schema.json');
const { createCoreSchema } = require('@strapi/strapi').factories;

module.exports = {
  ...createCoreSchema('api::category.category', schema)
};
