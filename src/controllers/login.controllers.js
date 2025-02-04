import { findUserByUsername } from '../models/loginModel.js';

export const getLogin = async (req, res) => {
    const result = await findUserByUsername(req.params.user);
    console.log(result)
    if (!result) {
        return res.status(401).json({ 
            success: false, 
            message: "Usuario o contraseña incorrecta",
            data: "",
         });
    }
        return res.status(200).json({
            success: true,
            message: "Autentificacion realizada con exito",
            data: result,
        });

};
