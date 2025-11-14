'use strict';

/**
 * article router.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/articles',
      handler: 'article.find',
      config: {
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/articles/:id',
      handler: 'article.findOne',
    },
    {
      method: 'POST',
      path: '/articles',
      handler: 'article.create',
    },
    {
      method: 'PUT',
      path: '/articles/:id',
      handler: 'article.update',
    },
    {
      method: 'DELETE',
      path: '/articles/:id',
      handler: 'article.delete',
    },
    {
      method: 'GET',
      path: '/articles/:id/related',
      handler: 'article.findRelated'
    }
  ]
};
