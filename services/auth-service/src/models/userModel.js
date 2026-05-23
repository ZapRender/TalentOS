const db = require('../config/database');

const USER_WITH_ROL = `
  SELECT u.id, u.nombre, u.apellidos, u.email, u.password_hash,
         u.empleado_id, u.activo, u.ultimo_login, u.creado_en,
         r.nombre AS rol
  FROM   usuarios u
  LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
  LEFT JOIN roles r          ON r.id = ur.rol_id
`;

const findByEmail = async (email) => {
  const { rows } = await db.query(`${USER_WITH_ROL} WHERE u.email = $1`, [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await db.query(`${USER_WITH_ROL} WHERE u.id = $1`, [id]);
  return rows[0] || null;
};

const getAll = async () => {
  const { rows } = await db.query(`${USER_WITH_ROL} ORDER BY u.id`);
  return rows.map(({ password_hash, ...u }) => u);
};

const create = async ({ nombre, apellidos, email, passwordHash, empleadoId, rolNombre }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: [user] } = await client.query(
      `INSERT INTO usuarios (nombre, apellidos, email, password_hash, empleado_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre, apellidos || null, email, passwordHash, empleadoId || null]
    );

    const { rows: [rol] } = await client.query(
      'SELECT id FROM roles WHERE nombre = $1', [rolNombre]
    );
    if (!rol) throw new Error(`Rol '${rolNombre}' no existe`);

    await client.query(
      'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)',
      [user.id, rol.id]
    );

    await client.query('COMMIT');
    return { ...user, rol: rolNombre };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const update = async (id, { nombre, apellidos, empleadoId, rolNombre }) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows: [user] } = await client.query(
      `UPDATE usuarios
       SET nombre      = COALESCE($1, nombre),
           apellidos   = COALESCE($2, apellidos),
           empleado_id = COALESCE($3, empleado_id)
       WHERE id = $4 RETURNING *`,
      [nombre || null, apellidos || null, empleadoId || null, id]
    );
    if (!user) throw new Error('Usuario no encontrado');

    if (rolNombre) {
      const { rows: [rol] } = await client.query(
        'SELECT id FROM roles WHERE nombre = $1', [rolNombre]
      );
      if (!rol) throw new Error(`Rol '${rolNombre}' no existe`);
      await client.query('DELETE FROM usuario_roles WHERE usuario_id = $1', [id]);
      await client.query(
        'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)',
        [id, rol.id]
      );
    }

    await client.query('COMMIT');
    return findById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updatePassword = async (id, passwordHash) => {
  await db.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
};

const updateLastLogin = async (id) => {
  await db.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [id]);
};

const toggleActive = async (id) => {
  const { rows: [user] } = await db.query(
    'UPDATE usuarios SET activo = NOT activo WHERE id = $1 RETURNING id, activo',
    [id]
  );
  return user || null;
};

module.exports = {
  findByEmail, findById, getAll,
  create, update, updatePassword, updateLastLogin, toggleActive,
};
