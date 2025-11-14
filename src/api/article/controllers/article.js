'use strict';

/**
 *  article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async findRelated(ctx) {
    const { id } = ctx.params;
    const { limit = 3 } = ctx.query;

    const currentArticle = await strapi.entityService.findOne('api::article.article', id, {
      populate: ['category', 'author']
    });

    if (!currentArticle) {
      return ctx.notFound('Article not found');
    }

    const relatedArticles = await strapi.entityService.findMany('api::article.article', {
      filters: {
        $and: [
          { id: { $ne: id } },
          {
            $or: [
              { category: { id: currentArticle.category?.id } },
              { author: { id: currentArticle.author?.id } }
            ]
          }
        ]
      },
      populate: ['cover', 'author', 'category'],
      sort: { publishedAt: 'desc' },
      limit: parseInt(limit)
    });

    return { data: relatedArticles };
  }
}));
