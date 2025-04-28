import {getConnection} from '../database/connection.js';
import sql from 'mssql'


export const getInformation = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("idClient", sql.Int, req.params.idClient)
    .query("SELECT CONCAT_WS(' ', nameClient, firtsLastNameClient, secondLastNameClient) AS [name], telephoneClient , urlPhotoClient, emailClient FROM H2O.CLIENTS_DATA WHERE idClient = @idClient")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message :"type not found" });
    }
    return res.status(200).json({
        success: true,
        message: 'informacion de perfil del cliente',
        data: {
            name: result.recordset[0].name,
            telephone: result.recordset[0].telephoneClient,
            urlImg: result.recordset[0].urlPhotoClient,
            email: result.recordset[0].emailClient,
        }
    });
};





