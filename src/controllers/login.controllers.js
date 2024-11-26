import e from 'express';
import {getConnection} from '../database/connection.js';
import sql from 'mssql'

export const getLogin = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("user", sql.VarChar, req.params.user)
    .input("key", sql.VarChar, req.params.key)
    .query("SELECT * FROM MIY_USERS WHERE nameUser = @user")
    if (result.rowsAffected[0] === 0) {
        return res.status(200).json({ message : "user not found", access : false  });
    }
    else{
        const password = result.recordset[0].passwordUser;
        const user = result.recordset[0].nameUser;
        console.log(password);
        console.log(user);
        
        if(req.params.key != password){
            return res.status(200).json({ 
                message : "incorrect  paswword", 
                access : false 
            });
        }
        else{
            return res.status(200).json({ 
                message : "acceso correcto", 
                access : true 
            });
        }
    }
};

//Crea un registo de cliente, publico general o insitucional
export const registerClient = async (req, res) => {
    const pool = await getConnection();

    //validamos si existe ya un registro del correo electronico
    const existe = await pool
    .request()
    .input("correo", sql.VarChar, req.body.correo)
    .query("SELECT idUser FROM MIY_USERS WHERE nameUser = @correo");
    if (existe.rowsAffected[0] === 0) {
        
        // Validar que el correo contenga el dominio institucional
        let typeClient = 5;
        if (req.body.correo && /@ulv\.edu\.mx$/.test(req.body.correo)) {
            typeClient = 4;
        }

        const result = await pool
        .request()
        .input("nameUser", sql.VarChar, req.body.correo)
        .input("password", sql.VarChar, req.body.password)
        .input("type", sql.Int, typeClient)
        .query('INSERT INTO MIY_USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@nameUser, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;');
        
        const idUser = result.recordset[0].idUser;

        if (!idUser) {
            return res.status(500).json({ message: "Error al crear el usuario" });
        }
        
       await pool
            .request()
            .input("idUser", sql.Int, idUser)
            .input("nombre", sql.VarChar, req.body.nombre)
            .input("apellidoPaterno", sql.VarChar, req.body.apellidoPaterno)
            .input("apellidoMaterno", sql.VarChar, req.body.apellidoMaterno)
            .input("telefono", sql.VarChar, req.body.telefono)
            .input("fechaNacimiento", sql.Date, req.body.fechaNacimiento)
            .input("sexo", sql.Char, req.body.sexo)
            .query('INSERT INTO MIY_CLIENTS_DATA (idUser, nameClient, firtsLastNameClient, secondLastNameClient, telephoneClient, urlPhotoClient, dateBirth, sexo) VALUES ( @idUser, @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, \'http://34.123.11.193:3000/public/image_profile.png\' , @fechaNacimiento, @sexo); SELECT SCOPE_IDENTITY() AS idClient;');
            
        return res.status(200).json({ 
                message : "usuario creado correctamente"
            });
    }
    else
    {
       
        return res.status(200).json({ message : "el usuario ya existe" });    
    }
   
};


