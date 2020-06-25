/**
 * Let the user know nothing was found here.
 */
export async function notFoundHandler(ctx) {
  ctx.notFound('Not found');
}
