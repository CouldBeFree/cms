import pwd from 'pwd';
import { env } from '../lib/env';
import { encodeToken, jwtAuth } from '../middleware/auth';

import { controller, post, get, del } from 'koa-dec-router';
import { AccountRepository } from '../repositories/Account';

const debug = require('debug')('example');

@controller('/api/v1/auth')
export default class AuthApiCtrl {
  @post('/token')
  async signin(ctx) {
    const { username, password } = ctx.request.body;

    const account = await AccountRepository.getAccountByUsername(username);
    if (!account) {
      return incorectUsernameOrPassword('No account');
    }

    if (!account.salt) {
      return await onLoginSuccess(AccountRepository.getPasswordHash(account, password));
    }

    try {
      const { hash } = await pwd.hash(password, account.salt);

      return await onLoginSuccess(hash);
    } catch (err) {
      return ctx.badRequest({ message: err });
    }

    async function onLoginSuccess(hash) {
      if (!env.DO_NOT_CHECK_PASSWORD && account.password !== hash) {
        return incorectUsernameOrPassword('Wrong hash');
      }

      // const companies = await AccountRepository.getAllowCompanies(account);
      // const company = companies.length ? companies[ 0 ] : null;

      const token = encodeToken(account);

      await account.updateOne({ loginDate: Date.now() });

      // if (company) {
      //   ctx.session.companyId = company._id;
      // }
      // ctx.session.userId = account._id;

      ctx.set('authorization', token);
      ctx.ok({
        token,
        account: account.toObject(),
        owner: account.owner.toObject(),
        // company
      });
    }

    function incorectUsernameOrPassword(reason) {
      ctx.badRequest({ message: 'Incorrect username or password', reason });
    }
  }

  @post('/sudo', jwtAuth())
  async sudoUser(ctx) {
    const { _id } = ctx.request.body;
    if (!ctx.state.account.canSudo) {
      return ctx.forbidden({ message: 'You haven\'t permissions to sudo' });
    }

    const sudoAccount = await AccountRepository.getAccountById(_id);
    if (!sudoAccount) {
      return ctx.forbidden({ message: 'Account not found' });
    }
    const token = encodeToken(ctx.state.account, null, sudoAccount);

    ctx.set('authorization', token);
    ctx.ok({ token });
  }

  @del('/sudo', jwtAuth())
  async logoutSudoUser(ctx) {
    const { _id } = ctx.request.body;
    if (!ctx.state.realAccount || !ctx.state.realAccount.canSudo) {
      return ctx.forbidden({ message: 'You haven\'t permissions to sudo' });
    }
    const token = encodeToken(ctx.state.realAccount);

    ctx.set('authorization', token);
    ctx.ok({ token });
  }

  @get('/account', jwtAuth())
  async account(ctx) {
    ctx.ok({
      account: ctx.state.account,
      owner: ctx.state.owner
    });
  }
}
