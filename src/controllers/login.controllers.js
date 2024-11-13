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
        return res.status(404).json({ message : "user not found" });
    }
    else{

        const password = result.recordset[0].passwordUser;
        const user = result.recordset[0].nameUser;
        console.log(password);
        console.log(user);
        
        if(req.params.key != password ){
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