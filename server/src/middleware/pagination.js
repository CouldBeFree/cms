export function paginationMiddleware (options) {
  const sortingOptions = options.sorting || {};
  const queryOptions = options.query || [];
  return async function (ctx, next) {
    let { page, query, size, sort } = ctx.request.query;
    let sorting = sortingOptions.default || {};
    page = +page || 1;
    size = +size || 25;

    let queryOr = query && queryOptions.map(field => {
      return {
        [field]: { $regex: `.*${escapeRegExp(query)}.*`, $options: 'i' }
      };
    });

    let skip = (page - 1) * size;
    ctx.pagination = {
      page,
      skip,
      size,
      sorting,
      query: (queryOr && queryOr.length) ? queryOr : null,
      apply
    };

    function apply (mongoQuery) {
      return mongoQuery
        .skip(skip)
        .limit(size)
        .sort(sorting)
      ;
    }

    await next();
  };

  function escapeRegExp (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }
}
