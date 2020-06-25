import { logger } from '../lib/logger'
import { env } from '../lib/env'

import Domain from '../models/Domain';

export async function domainDetect(ctx, next) {
    const hostname = ctx.request.hostname;
    const [host, port] = hostname.split(':');

    ctx.state.domain = await Domain.findOne({ name: host }).lean();
    if (!ctx.state.domain) {
        return ctx.notFound({ message: 'Domain not found' });
    }

    await next();
}
