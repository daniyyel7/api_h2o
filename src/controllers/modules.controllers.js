import {getConnection} from '../database/connection.js';
import sql from 'mssql'


export const createModule = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .query('INSERT INTO H2O.MODULES (nameModule) VALUES (@name); SELECT SCOPE_IDENTITY() AS idModule;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not create module"});
    }
    res.status(200).json({
        message : "module create",
        id : result.recordset[0].idModule,
        name : req.body.name
    });
};