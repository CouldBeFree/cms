import jwt from 'jsonwebtoken';
import { env } from '../lib/env';
import { AccountRepository } from '../repositories/Account';

export function jwtAuth({ account = true, company = true } = {}) {
  return async (ctx, next) => {
    if (!ctx.header.authorization) {
      return ctx.unauthorized({ message: '"Authorization" header expected' });
    }
    const [, token] = ctx.header.authorization.split(' ');
    const decoded = jwt.decode(token, env.JWT_SECRET);
    if (!decoded) {
      return ctx.unauthorized({ message: '"Authorization" has wrong value' });
    }

    const { accountId, companyId, sudoAccountId } = decoded;
    console.info('decoded', accountId, companyId, sudoAccountId)
    if (accountId) {
      ctx.state.account = await AccountRepository.getAccountById(accountId);
      ctx.state.ownerId = ctx.state.account.owner._id;
    }
    if (sudoAccountId) {
      ctx.state.realAccount = ctx.state.account;
      ctx.state.account = await AccountRepository.getAccountById(sudoAccountId);
      ctx.state.ownerId = ctx.state.account.owner._id;
      ctx.set('x-account-sudo', ctx.state.realAccount.username);
    }
    // if (companyId) {
    //   ctx.state.company = await Company.findOne({ _id: companyId, removed: { $exists: false } });
    // }
    if (account && !ctx.state.account) {
      return ctx.unauthorized({ message: 'Account not found' });
    }
    ctx.state.owner = ctx.state.account.owner;

    // if (company && !ctx.state.company) {
    //   return ctx.unauthorized({ message: 'Company not found' });
    // }
    return await next();
  };
}

export function encodeToken(account, company, sudoAccount = null) {
  const companyId = company ? company._id : null;
  const params = { accountId: account._id, companyId };

  if (sudoAccount) {
    params.sudoAccountId = sudoAccount._id;
  }


  return jwt.sign(params, env.JWT_SECRET);
}
