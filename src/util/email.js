import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "daniel.juarez@ulv.edu.mx", // tu correo
    pass: "fiomdcarvosudfzh", // tu contraseña o app password
  },
});

/**
 * Envía un correo según el tipo de acción.
 * @param {string} to - Correo del destinatario.
 * @param {string} type - Tipo de correo: 'code' o 'confirmation'.
 * @param {object} data - Datos dinámicos: { code } o { nameUser }.
 */
export const sendEmail = async (to, type, data = {}) => {
  let subject = "";
  let html = "";

  if (type === "code") {
    subject = "Código de verificación para restablecer contraseña";
    html = htmlCode(data.code);
  } else if (type === "confirmation") {
    subject = "Contraseña actualizada correctamente";
    html = htmlConfirmation();
  } else if (type === "registre") {
    subject = "Registro Agua Linda Vista";
    html =  htmlRegistro(data.name, data.nameUser);
  } else {
    throw new Error("Tipo de correo no soportado.");
  }

  await transporter.sendMail({
    from: `"H2O App" <daniel.juarez@ulv.edu.mx>`,
    to,
    subject,
    html,
  });
};

const htmlCode = (code) => `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Restablecimiento de Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 20px; margin-bottom: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <!-- HEADER -->
        <tr>
            <td align="center" bgcolor="#0056b3" style="padding: 30px 30px 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Restablecimiento de Contraseña</h1>
            </td>
        </tr>
        <!-- BODY -->
        <tr>
            <td align="left" style="padding: 40px 30px 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="padding: 20px 0 20px 0;">
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para completar este proceso, utiliza el siguiente código:</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 0 20px 0;">
                            <div style="background-color: #f0f7ff; border: 1px solid #cce5ff; border-radius: 6px; padding: 20px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0056b3; max-width: 300px; margin: 0 auto;">
                            ${code}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 0 20px 0;">
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">Este código es válido durante <strong>10 minutos</strong>. Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- FOOTER -->
        <tr>
            <td align="center" bgcolor="#f5f5f5" style="padding: 20px 30px 20px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; color: #666666; font-size: 14px; line-height: 20px;">
                <p style="margin: 0;">Este es un correo electrónico automático, por favor no respondas.</p>
                <p style="margin: 10px 0 0 0;">© 2025 Agua Linda Vista. Todos los derechos reservados.</p>
                <p style="margin: 10px 0 0 0;">
                </p>
            </td>
        </tr>
    </table>
</body>
</html>

`;

const htmlConfirmation = () => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Confirmación de Cambio de Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 20px; margin-bottom: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <!-- HEADER -->
        <tr>
            <td align="center" bgcolor="#0056b3" style="padding: 30px 30px 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Confirmación de Cambio de Contraseña</h1>
            </td>
        </tr>
        <!-- BODY -->
        <tr>
            <td align="left" style="padding: 40px 30px 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="padding: 20px 0 20px 0;">
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">Te informamos que la contraseña de tu cuenta ha sido cambiada exitosamente</strong>.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 0 0 0; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 14px; line-height: 22px; color: #555555;"><strong>Consejos de seguridad:</strong></p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; line-height: 22px; color: #555555;">
                                <li>Nunca compartas tu contraseña con nadie.</li>
                                <li>Utiliza contraseñas diferentes para cada servicio.</li>
                                <li>Cambia tu contraseña periódicamente.</li>
                                <li>Asegúrate de cerrar sesión en dispositivos públicos.</li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- FOOTER -->
        <tr>
            <td align="center" bgcolor="#f5f5f5" style="padding: 20px 30px 20px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; color: #666666; font-size: 14px; line-height: 20px;">
                <p style="margin: 0;">Este es un correo electrónico automático, por favor no respondas.</p>
                <p style="margin: 10px 0 0 0;">© 2025 Agua Linda Vista. Todos los derechos reservados.</p>
                <p style="margin: 10px 0 0 0;">
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">Si no reconoces esta actividad, por favor contacta inmediatamente con nuestro equipo de soporte.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const htmlRegistro = (name, nameUser) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Confirmación de Cuenta Creada</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin-top: 20px; margin-bottom: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <!-- HEADER -->
        <tr>
            <td align="center" bgcolor="#0056b3" style="padding: 30px 30px 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Bienvenid@ a Agua Linda Vista</h1>
            </td>
        </tr>
        <!-- BODY -->
        <tr>
            <td align="left" style="padding: 40px 30px 40px 30px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td>
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">Estimad@ ${name},</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 0 20px 0;">
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">Gracias por registrarte en Agua Linda Vista. ¡Tu cuenta ha sido creada exitosamente!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 0 20px 0;">
                            <p style="margin: 0; font-size: 16px; line-height: 24px; color: #333333;">Detalles de tu cuenta:</p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 16px; line-height: 24px; color: #333333;">
                                <li>Correo electrónico: ${nameUser}</li>
                                <li>Nombre de usuario: ${nameUser}</li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- FOOTER -->
        <tr>
            <td align="center" bgcolor="#f5f5f5" style="padding: 20px 30px 20px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; color: #666666; font-size: 14px; line-height: 20px;">
                <p style="margin: 0;">Este es un correo electrónico automático, por favor no respondas.</p>
                <p style="margin: 10px 0 0 0;">© 2025 Agua Linda Vista. Todos los derechos reservados.</p>
                <p style="margin: 10px 0 0 0;">
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">Has recibido este correo porque te has registrado en Agua Linda Vista.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;
