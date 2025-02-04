export const queries = {
    getUserByName : "SELECT * FROM H2O.USERS WHERE nameUser = @user",
    validateUser : "SELECT idUser FROM H2O.USERS WHERE nameUser = @correo",
    insertUser : "INSERT INTO H2O.USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@nameUser, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;",
    insertClient : "INSERT INTO H2O.CLIENTS_DATA (idUser, nameClient, firtsLastNameClient, secondLastNameClient, telephoneClient, urlPhotoClient, dateBirth, sexo) VALUES ( @idUser, @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, \'http://34.123.11.193:3000/public/image_profile.png\' , @fechaNacimiento, @sexo); SELECT SCOPE_IDENTITY() AS idClient;",
};