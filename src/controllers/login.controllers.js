import { 
    createUser,
    findUserByUsername, 
    userExiste 
} from '../models/loginModel.js';

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

//Crea un registo de cliente, publico general o insitucional
export const registerClient = async (req, res) => {
    //validamos si existe ya un registro del correo electronico
    const existe = await userExiste(req);
    
    if (!existe) {
        
        // Validar que el correo contenga el dominio institucional
        let typeClient = 5;
        if (req.body.correo && /@ulv\.edu\.mx$/.test(req.body.correo)) {
            typeClient = 4;
        }
        const user = createUser(req, typeClient);
      
        return res.status(200).json({
                success : true, 
                message : "usuario creado correctamente",
                data : user,
            });
    }
    else
    {
        return res.status(200).json({ 
            success : false,
            message : "el usuario ya existe",
            data : "",
        });    
    }
   
};