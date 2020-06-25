export function sortingParser(ctx) {
    const sorting = {};
    // console.log('ctx.request.query', ctx.request.query);
    if(ctx.request.query['sorting.prop']) {
        sorting[ctx.request.query['sorting.prop']] = ctx.request.query['sorting.order'] == 'ascending' ? 1 : -1;
    }
    return sorting;
}