const jwt = require('jsonwebtoken');

const secret     = () => process.env.JWT_SECRET;
const expiresIn  = () => process.env.JWT_EXPIRES_IN         || '8h';
const refreshExp = () => process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const sign        = (payload) => jwt.sign(payload, secret(), { expiresIn: expiresIn() });
const signRefresh = (payload) => jwt.sign(payload, secret(), { expiresIn: refreshExp() });
const verify      = (token)   => jwt.verify(token, secret());

module.exports = { sign, signRefresh, verify };
