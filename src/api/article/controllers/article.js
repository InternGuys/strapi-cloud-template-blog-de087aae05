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

    // First, get articles from the same category
    const categoryArticles = await strapi.entityService.findMany('api::article.article', {
      filters: {
        $and: [
          { id: { $ne: id } },
          { category: { id: currentArticle.category?.id } }
        ]
      },
      populate: ['cover', 'author', 'category'],
      sort: { createdAt: 'desc' },
      limit: parseInt(limit)
    });

    // If we don't have enough category articles, get articles by the same author
    let relatedArticles = [...categoryArticles];

    if (relatedArticles.length < parseInt(limit)) {
      const authorArticles = await strapi.entityService.findMany('api::article.article', {
        filters: {
          $and: [
            { id: { $ne: id } },
            { author: { id: currentArticle.author?.id } },
            { id: { $notIn: relatedArticles.map(article => article.id) } }
          ]
        },
        populate: ['cover', 'author', 'category'],
        sort: { createdAt: 'desc' },
        limit: parseInt(limit) - relatedArticles.length
      });

      relatedArticles = [...relatedArticles, ...authorArticles];
    }

    return { data: relatedArticles.slice(0, parseInt(limit)) };
  }
}));
