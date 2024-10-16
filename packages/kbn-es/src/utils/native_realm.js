/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { Client } = require('@elastic/elasticsearch');
const chalk = require('chalk');

const { log: defaultLog } = require('./log');

exports.NativeRealm = class NativeRealm {
  constructor({ elasticPassword, port, log = defaultLog, ssl = false, caCert }) {
    const auth = { username: 'elastic', password: elasticPassword };
    this._client = new Client(
      ssl
        ? { node: `https://localhost:${port}`, ssl: { ca: caCert, rejectUnauthorized: true }, auth }
        : { node: `http://localhost:${port}`, auth }
    );
    this._elasticPassword = elasticPassword;
    this._log = log;
  }

  async setPassword(username, password = this._elasticPassword, retryOpts = {}) {
    await this._autoRetry(retryOpts, async () => {
      try {
        await this._client.security.changePassword({
          username,
          refresh: 'wait_for',
          body: {
            password,
          },
        });
      } catch (err) {
        const isAnonymousUserPasswordChangeError =
          err.statusCode === 400 &&
          err.body &&
          err.body.error &&
          err.body.error.reason.startsWith(`user [${username}] is anonymous`);
        if (!isAnonymousUserPasswordChangeError) {
          throw err;
        } else {
          this._log.info(
            `cannot set password for anonymous user ${chalk.bold(username)}, skipping`
          );
        }
      }
    });
  }

  async setPasswords(options) {
    if (!(await this.isSecurityEnabled())) {
      this._log.info('security is not enabled, unable to set native realm passwords');
      return;
    }

    const reservedUsers = await this.getReservedUsers();
    await Promise.all(
      reservedUsers.map(async (user) => {
        await this.setPassword(user, options[`password.${user}`]);
      })
    );
  }

  async getReservedUsers(retryOpts = {}) {
    return await this._autoRetry(retryOpts, async () => {
      const resp = await this._client.security.getUser();
      const usernames = Object.keys(resp.body).filter(
        (user) => resp.body[user].metadata._reserved === true
      );

      if (!usernames?.length) {
        throw new Error('no reserved users found, unable to set native realm passwords');
      }

      return usernames;
    });
  }

  async isSecurityEnabled(retryOpts = {}) {
    try {
      return await this._autoRetry(retryOpts, async () => {
        const {
          body: { features },
        } = await this._client.xpack.info({ categories: 'features' });
        return features.security && features.security.enabled && features.security.available;
      });
    } catch (error) {
      if (error.meta && error.meta.statusCode === 400) {
        return false;
      }

      throw error;
    }
  }

  async _autoRetry(opts, fn) {
    const { attempt = 1, maxAttempts = 3 } = opts;

    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      const sec = 1.5 * attempt;
      this._log.warning(`assuming ES isn't initialized completely, trying again in ${sec} seconds`);
      await new Promise((resolve) => setTimeout(resolve, sec * 1000));

      const nextOpts = {
        ...opts,
        attempt: attempt + 1,
      };
      return await this._autoRetry(nextOpts, fn);
    }
  }
};
