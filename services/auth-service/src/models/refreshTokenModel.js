const db = require('../config/database');

const create = async (usuarioId, token, expiresAt) => {
  const { rows: [rt] } = await db.query(
    'INSERT INTO refresh_tokens (usuario_id, token, expira_en) VALUES ($1, $2, $3) RETURNING *',
    [usuarioId, token, expiresAt]
  );
  return rt;
};

const findByToken = async (token) => {
  const { rows: [rt] } = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token = $1 AND revocado = false AND expira_en > NOW()`,
    [token]
  );
  return rt || null;
};

const revoke = async (token) => {
  await db.query(
    'UPDATE refresh_tokens SET revocado = true WHERE token = $1',
    [token]
  );
};

const revokeAllByUser = async (usuarioId) => {
  await db.query(
    'UPDATE refresh_tokens SET revocado = true WHERE usuario_id = $1',
    [usuarioId]
  );
};

module.exports = { create, findByToken, revoke, revokeAllByUser };
