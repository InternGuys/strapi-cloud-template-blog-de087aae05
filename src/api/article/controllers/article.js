'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
  async findRelated(ctx) {
    const id = Number(ctx.params.id);
    const target = parseInt(ctx.query.limit) || 3;

    const currentArticle = await strapi.entityService.findOne('api::article.article', id, {
      populate: ['category', 'author'],
    });

    if (!currentArticle) {
      return ctx.notFound('Article not found');
    }

    const categoryId = currentArticle.category?.id;
    const company = (currentArticle.title || '').trim().split(' ')[0];
    const currentTitle = (currentArticle.title || '').trim().toLowerCase();

    const collected = [];
    const seen = new Set([id]);
    const seenTitles = new Set([currentTitle]);
    const populate = ['cover', 'author', 'category'];

    const add = (articles) => {
      for (const a of articles) {
        if (collected.length >= target) break;
        if (seen.has(a.id)) continue;
        const t = (a.title || '').trim().toLowerCase();
        if (seenTitles.has(t)) continue;   // title-level dedup safety net
        seen.add(a.id);
        seenTitles.add(t);
        collected.push(a);
      }
    };

    // Bucket 1: 2 newest in the same category
    if (categoryId) {
      const newest = await strapi.entityService.findMany('api::article.article', {
        filters: { $and: [{ id: { $notIn: Array.from(seen) } }, { category: { id: categoryId } }] },
        populate,
        sort: { createdAt: 'desc' },
        limit: 2,
      });
      add(newest);
    }

    // Bucket 2: up to 2 from the same company (any category)
    if (company) {
      const companyArticles = await strapi.entityService.findMany('api::article.article', {
        filters: {
          $and: [
            { id: { $notIn: Array.from(seen) } },
            { title: { $startsWith: company } },
          ],
        },
        populate,
        sort: { createdAt: 'desc' },
        limit: 2,
      });
      add(companyArticles);
    }

    // Bucket 3: fill remaining with random articles from the same category
    if (categoryId && collected.length < target) {
      const pool = await strapi.entityService.findMany('api::article.article', {
        filters: {
          $and: [
            { id: { $notIn: Array.from(seen) } },
            { category: { id: categoryId } },
          ],
        },
        populate,
        sort: { createdAt: 'desc' },
        limit: 30,
      });
      add(shuffle(pool));
    }

    return { data: collected.slice(0, target) };
  },
}));
