# Documentación de cambios de la refactorización de la Api.


#### Se inicializa el archivo README
Este archivo contiene la documentación de cambios, configuraciones y actualizaciones de la api.


#### Creación de archivo .env
Se utiliza para almacenar variables de entorno, que son valores que pueden cambiar dependiendo del entorno en el que se ejecuta la aplicación; Esto hace que el código sea más limpio, más fácil de mantener y más seguro.

**Se agrego el usuario, contraseña y nombre del servidor y sera usado en la conexión a DB**


#### Configuración de la conexión a la DB
En la carpeta database se modifico el archivo **connection** usando los valores del .env el cual contiene la información pertinente de la Db en uso, de esa forma tenemos una separación de responsabilidades.


#### Sepración de responsabilidades


