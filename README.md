Nota: Ejecute ctrl + shift + v para previsualizar el archivo .md con formato

# Refactorización del módulo cartshopping con clean architecture
Este módulo es el encargado de gestionar todas las acciones que tengan que ver con el carrito de compras dentro de la API.
Antes de hacer la refactorización había una dependencia entre la capa de presentación (el controlador) y la lógica de negocio, haciendo que el código 
fuera difícil de mantener y no reutilizable.
El objetivo de la asginación era mejorar la estructura utilizando la arquitectura limpia, así que se separaron las responsabilidades
en las capas ya definidas.

## Cambios realizados
Se reestructuró el código sólo del módulo seleccionado teniendo en cuenta el principio de separación de responsabilidades, diviendo las funcionalidades del módulo en:
- src/
 - ├── database
 - ├── modules/
    - ├── cartshopping
        - ├── controllers/
            - ├── cartshopping.controllers.js
        - ├── repositories/
            - ├── cartshopping.repository.js
        - ├── routes/
            - ├── cartshopping.routes.js
        - ├── usecases/
            - ├── add_product_cartshopping.js
            - ├── get_cartshopping.js
            - ├── update_product_cartshopping.js
    - ├── products 
    - ├── users
 - ├── public
 - ├── app.js
 - ├── config.js
 - ├── server.js
 - ├── swagger.json
 - ├── .gitignore
 - ├── package-lock.json 
 - ├── package.json
 - ├── README.md

## Explicación de cada capa
- Controladores (controllers/): Antes contenía la lógica de negocio y las consultas a la base de datos, ahora solo recibe las solicitudes HTTP y manda la lógica a los casos de uso.
- Rutas (routes/): Define los endpoints y los asocia con los controladores, también hace que la API esté desacoplada de la lógica de negocio.
- Casos de uso (usecases/): Contienen la lógica de negocio en archivos independientes según cada acción que realicen, se aplica el principio SRP.
- Repositorios (repositories/): Maneja la interacción con la base datos y facilita la reutilización.

## Aplicación de los principios de arquitectura limpia
- Separación de responsabilidades: Antes el controlador tenía la lógica de negocio y las consultas SQL, ahora cada capa cumple una función específica.
- Independencia de frameworks: La lógica de negocio no depende de Express ni de la base de datos. En caso de que la bd llegara a cambiarse, solo es necesario modificar la capa de repositorios.
- Facilidad de hacer pruebas unitarias: Antes probar la lógica de negocio requería un entorno de base de datos, ahora los usecases pueden probarse independientemente.
- Reutilización de código: En caso de que se necesite, otros módulos pueden reutilizar las consultas del repositorio sin duplicar código.

## Beneficios de la refactorización del código
Ya fueron mencionados anteriormente, pero los listo a continuación:
- Mantenibilidad: Cada componente está claramente separado.
- Escalabilidad: Es fácil agregar nuevas funcionalidades sin afectar el código existente.
- Facilidad para pruebas: Ahora se pueden hacer pruebas unitarias en cada capa.
- Flexibilidad: Se puede cambiar la base de datos o el framework sin afectar la lógica de negocio.

## Análisis de la refactorización y conclusión
La refactorización de este módulo permitió mejorar la modularidad y escalabilidad del código. 
Con la separación de capas, se logró un código más limpio y mantenible, facilitando la incorporación de nuevas funcionalidades sin afectar las existentes.
El uso de la arquitectura limpia redujo la dependencia con frameworks, permitiendo que si se requiere, se puedan cambiar tecnologías sin impactar la lógica de negocio. 
Además, se mejoró la capacidad de prueba, ya que ahora es posible realizar tests unitarios de manera más sencilla.
La arquitectura limpia contribuye a la creación de sistemas robustos y fáciles de mantener para tener una mayor eficiencia en el desarrollo y menor riesgo de errores a largo plazo.
