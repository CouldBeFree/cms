export function pagerParser(ctx) {
    const pager = {};
    pager.page = parseInt((ctx.request.query['pager.page'] || 1) + '', 10);
    pager.count = parseInt((ctx.request.query['pager.count'] || 20) + '', 10);
    pager.skip = (pager.page - 1) * pager.count;
    return pager;
}