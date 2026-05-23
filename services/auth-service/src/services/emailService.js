const nodemailer = require('nodemailer');

const getTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendTempPassword = async (email, nombre, tempPassword) => {
  await getTransporter().sendMail({
    from:    process.env.SMTP_FROM,
    to:      email,
    subject: 'TalentOS — Tu contraseña temporal',
    html: `
      <h2>Bienvenido/a a TalentOS, ${nombre}</h2>
      <p>Tu cuenta ha sido creada. Tu contraseña temporal es:</p>
      <p style="font-size:1.4em;font-weight:bold;letter-spacing:2px">${tempPassword}</p>
      <p>Por seguridad, cámbiala en tu primer inicio de sesión.</p>
    `,
  });
};

module.exports = { sendTempPassword };
