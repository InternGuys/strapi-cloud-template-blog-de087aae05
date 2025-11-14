'use strict';

/**
 * article router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    ...createCoreRouter('api::article.article').routes,
    {
      method: 'GET',
      path: '/articles/:id/related',
      handler: 'article.findRelated'
    }
  ]
};
