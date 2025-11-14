'use strict';

/**
 * article router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::article.article');

const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/articles/:id/related',
      handler: 'article.findRelated'
    }
  ]
};

module.exports = {
  routes: [
    ...defaultRouter.routes,
    ...customRoutes.routes
  ]
};
