# Documentación de cambios de la refactorización de la Api.

#### Problemas del código original
* No estaba distribuido por capas.
* Todo se encontraba en un mismo archivo, contraseñas, lógica, el manejo de las respuestas, las consultas a la DB.
* No existia documentación.
* Algunos modulos o funciones no tenian nombres adecuados para lo que hacian.
* No tenia nada de arquitectura limpia
* 

#### Se inicializa el archivo README
Este archivo contiene la documentación de cambios, configuraciones y actualizaciones de la api.


#### Creación de archivo .env
Se utiliza para almacenar variables de entorno, que son valores que pueden cambiar dependiendo del entorno en el que se ejecuta la aplicación; Esto hace que el código sea más limpio, más fácil de mantener y más seguro.

**Se agrego el usuario, contraseña y nombre del servidor y sera usado en la conexión a DB**.


#### Configuración de la conexión a la DB
En la carpeta database se modifico el archivo **connection** usando los valores del .env el cual contiene la información pertinente de la Db en uso, de esa forma tenemos una separación de responsabilidades y mayor privacidad.


#### Separación de responsabilidades
Se crearon las carpetas de: 

* Repositories = Solo acceden a la base de datos, o la modifican.
* Services = Gestionan la lógica de negocio como validaciones o reglas y como responder al controlador.
* Controllers = Manejan e interactuan con el exterior con respecto a las peticiones http.
* Models = Estructura con la que se manejaran los datos para ser usados. 


#### Creación de modelos
Se crearon los modelos, para manejar por medio de una estructura la información, esto asegura que lo que entra o sale entra de la api tenga un formato y contenido directo.

Se creo un modelo por cada sonsulta o solicitud, el cual es usado en el service para el manejo de la respuesta y de como lo mandara al controller para ser utilizado.


#### ProductsRepository
Se crearon las consultas a la Db para traer la información pertinente y así usarlas en el services.

**Antes todo se encontraba en el controller**


#### ProductsService
Se hacen las validaciones para cada consulta existente y lanza un mensaje de error en caso de no encontrar lo solicitado, hacer esto cumple con la capa de casos de uso.

**Antes todo se encontraba en el controller**


#### productsController
Las peticiones de parte de la interfaz llegan aquí con sus respectivos parametros (req,res), los cuales se redireccionan al services para ser procesados y obtener una respuesta.

Aquí se encontraba toda la lógica en el mismo archivo, al separarlo se aplico la separación de responsabilidades por capas.


#### ProductsRoutes
Es el responsable de definir las URLs o endpoints a los que los clientes (por ejemplo, una app frontend o Postman) pueden hacer peticiones, se reestructuro de acuerdo a los cambios realizados en otras partes, de tal manera que halla buena acoplación



#### Retos enfrentados
* Comprender los conceptos que deben ser utilizados para aplicar correctamente la arquitectura limpia.
* Manejo de errores al realizar cambios.
* Refactorizar la Api aplicando las capas de arquitectura.
* Realizar una documentación clara para cualquier persona que desee revisar proyecto.
* Implementar con el Frontend
* 


#### Beneficios de la refactorización
* Mayor control sobre el código
* Mantenible
* Limpio
* Cambios rápidos 
* Mayor reutilización de código
* Testeo Fácil
* Escalable

--------------------------
##### Ejemplos y guías recopilados de:
[Tutorial de Tutorial Markdown](https://tutorialmarkdown.com)
[Guía definitiva de Markdown](https://neoguias.com/markdown)
[¿Qué es Clean Architecture?](https://www.youtube.com/watch?v=EI4nOsec2Ao)
[CLEAN ARCHITECTURE en Node con TypeScript](https://www.youtube.com/watch?v=497L4-LhvdM)
[Apuntes de clase]()



