import pwd from 'pwd';
import _ from 'lodash';
import crypt from 'crypt3/sync';
import Account, { ACCOUNT_TYPE_ADMIN, ACCOUNT_TYPE_SUPPORT } from '../models/Account';
import DataOwner from '../models/DataOwner';

export class AccountRepository {
  static async createDataOwner() {
    const dataOwner = new DataOwner();
    await dataOwner.save();
    return dataOwner;
  }

  static async createAccount(owner, username, password) {
    const account = new Account({
      owner,
      username
    });
    const { hash, salt } = await pwd.hash(password);

    account.password = hash;
    account.salt = salt;

    await account.save();
    return account;
  }

  static getAccountById(accountId, active = true) {
    return Account.findOne({ _id: accountId, activated: true, removed: { $exists: false } }, { password: 0, salt: 0, __v: 0 });
  }

  static async getAccountByUsername(username, active = true) {
    const query = {
      authType: 'system',
      $or: [ { username }, { email: username } ],
      removed: { $exists: false }
    };
    query.activated = active;
    return Account.findOne(query);
  }

  static async getPasswordHash(account, password) {
    return crypt(password, account.password);
  }

  static async getAllowCompanies(account) {
    const fields = { _id: 1, title: 1, oldId: 1 };
    const params = { removed: { $exists: false } };

    if (account.accountType === ACCOUNT_TYPE_ADMIN) {
      // all companies
    } else if (account.accountType === ACCOUNT_TYPE_SUPPORT) {
      // all companies
    } else {
      const ids = _.map(account.permissionCompanies || [], company => company._id.toString());
      params.$or = [
        { 'ownedBy._id': account._id },
        { _id: { $in: ids } }
      ];
    }

    const companies = await Company.find(params, fields).sort({ title: 1 }).lean();
    if (companies.length > 1 && account.lastCompany && account.lastCompany._id) {
      const lastCompany = companies.find(company => company._id === account.lastCompany._id);
      if (lastCompany) {
        return [
          lastCompany,
          ... _.without(companies, lastCompany)
        ];
      }
    }
    return companies;
  }

}
