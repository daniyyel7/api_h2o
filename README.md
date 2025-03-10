# Documentación de cambios de la refactorización de la Api.


#### Se inicializa el archivo README
Este archivo contiene la documentación de cambios, configuraciones y actualizaciones de la api.


#### Creación de archivo .env
Se utiliza para almacenar variables de entorno, que son valores que pueden cambiar dependiendo del entorno en el que se ejecuta la aplicación; Esto hace que el código sea más limpio, más fácil de mantener y más seguro.

**Se agrego el usuario, contraseña y nombre del servidor y sera usado en la conexión a DB**


#### Configuración de la conexión a la DB
En la carpeta database se modifico el archivo **connection** usando los valores del .env el cual contiene la información pertinente de la Db en uso, de esa forma tenemos una separación de responsabilidades.


#### Separación de responsabilidades

Se crearon las carpetas de: 

* Repositories = Solo acceden a la base de datos, o la modifican 
* Services = Gestionan la lógica de negocio como validaciones o reglas y como responder al controlador
* Controllers = Manejan e interactuan con el exterior 


#### ProductsRepository
Se crearon las consultas a la Db para traer la información pertinente y así usarlas en el services

**Antes todo se encontraba en el controller**

#### ProductsService
Se hacen las validaciones para cada consulta existente y lanza un mensaje de erro en caso de no encontrar lo solicitado

**Antes todo se encontraba en el controller**


#### productsController



