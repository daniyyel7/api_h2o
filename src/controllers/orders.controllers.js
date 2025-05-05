import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const createOrder = async (req, res) => {
  const pool = await getConnection();

  //Busca los productos del carrito
  const productsCar = await pool
    .request()
    .input("idClient", sql.Int, req.body.client)
    .query(
      "SELECT MCS.idProduct, MCS.quantity, PPT.price AS priceProduct, PPT.idTypeUser FROM H2O.CART_SHOPPING MCS INNER JOIN (SELECT * FROM H2O.PRODUCTS_PRICE WHERE idTypeUser = (SELECT MUT.idTypeUser FROM H2O.CLIENTS_DATA MCD INNER JOIN H2O.USERS MU ON MCD.idUser = MU.idUser INNER JOIN H2O.USERS_TYPE MUT ON MU.idTypeUser = MUT.idTypeUser WHERE MCD.idClient = @idClient)) PPT ON MCS.idProduct = PPT.idProduct WHERE MCS.idClient = @idClient AND MCS.idStatusProductCar = 1;"
    );

  //validar que exista productos
  if (productsCar.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "products not found",
      data: {},
    });
  }

  //Busca las ordenes con deuda
  const debt = await pool
    .request()
    .input("idClient", sql.Int, req.body.client) // Fecha como parámetro
    .execute(`H2O.STP_LIST_ORDERS_DEBT_BY_CLIENT`);

  const orders = debt.recordset;

  // Verificar si se encontraron resultados
  if (debt.recordset.length !== 0) {
    // Calcular el total de deuda
    const totalDebt = orders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    //validar que deuda
    if (totalDebt >= 150) {
      return res.status(401).json({
        success: false,
        message: `Cuenta con un adeudo de $${totalDebt} `,
        data: {},
      });
    }
  }

  //Con el tipo de cliente buscamos el tipo de pago permitido si es efectivo o cargo
  const typeUser = productsCar.recordset[0].idTypeUser;
  const getTypePay = await pool
    .request()
    .input("idTypeUser", sql.Int, typeUser) // Fecha como parámetro
    .query(`SELECT * FROM H2O.USERS_TYPE WHERE idTypeUser = @idTypeUser`);

  let idTypePayment = getTypePay.recordset[0].idTypePayment;

  let statusPayment = 0;

  
  //guarda los productos
  const cartItems = productsCar.recordset;

  //Insertar la orden
  const insertOrder = await pool
    .request()
    .input("idClient", sql.Int, req.body.client)
    .input("idAddress", sql.Int, req.body.address)
    .input("total", sql.Decimal, req.body.total)
    .input("idTypePayment", sql.Int, idTypePayment)
    .input("commentOrder", sql.NVarChar, req.body.comment)
    .input("dateDelivery", sql.NVarChar, req.body.dateDelivery)
    .query(
      "INSERT INTO H2O.ORDERS ( idClient, dateOrder, idAddress, idOrderStatus, total, idTypePayment, commentOrder, dateDelivery, idStatusPayment) VALUES (@idClient, GETDATE() , @idAddress, 1,@total, @idTypePayment, @commentOrder, @dateDelivery, 0); SELECT SCOPE_IDENTITY() AS idOrder;   "
    );

  //Validar la orden se insertara correctamente
  if (insertOrder.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "error could not add order" });
  }

  //Insertar el registro en el historial
  //  De aacuerdo al catalogo
  // 1	pendiente	Orden pendiente de aceptación por el personal de la planta purificadora
  // 2	aceptada	Orden aceptada por la planta purificadora
  // 3	en camino	Orden esta en camino para su entrega
  // 4	entregado	Orden entregada en la dirección indica
  // 5	cancelada	Orden rechazada por el personal de la planta purificadora
  // 6	cancelada por cliente	El cliente canceló la orden
  // 7	no entregada	Orden que el repartidor marco que no entrego por algun motivo
  const idOrder = insertOrder.recordset[0].idOrder;
  const idOrderStatus = 1;
  const idStaff = 0;

  const updateHistroyOrder = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idOrderStatus", sql.Int, idOrderStatus)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO  H2O.ORDERS_STATUS_HISTORY (idOrder, idOrderStatus, dateOrderStatusHistory, idStaff)
     VALUES (@idOrder, @idOrderStatus, GETDATE(), @idStaff)`
    );

  if (updateHistroyOrder.rowsAffected[0] === 0) {
    console.log("error de history");
  }

  // Actualizar pago
  const idStatusPayment = 0;
  const updateHistroyPayment = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idStatusPayment", sql.Int, idStatusPayment)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO H2O.ORDERS_PAYMENT_HISTORY (idOrder, idStatusPayment, dateStatusPayment, idStaff)
      VALUES(@idOrder, @idStatusPayment, GETDATE(), @idStaff)`
    );

  if (updateHistroyPayment.rowsAffected[0] === 0) {
    console.log("error de history payment");
  }

  //Se inserta una fila por producto en detalle de la orden
  for (const item of cartItems) {
    await pool
      .request()
      .input("idOrder", sql.Int, idOrder)
      .input("idProduct", sql.Int, item.idProduct)
      .input("quantity", sql.Int, item.quantity)
      .input("priceProduct", sql.Decimal, item.priceProduct)
      .input("subtotal", sql.Decimal, item.quantity * item.priceProduct).query(`
                INSERT INTO H2O.ORDERS_DETAIL (idOrder, idProduct, quantity, priceProduct, subtotal)
                VALUES (@idOrder, @idProduct, @quantity, @priceProduct, @subtotal);
            `);
  }

  //Se actuliza el estado de los productos del carrio a comprado a comprado
  await pool.request().input("idClient", sql.Int, req.body.client).query(`
        UPDATE H2O.CART_SHOPPING 
        SET idStatusProductCar = 3 
        WHERE idClient = @idClient AND idStatusProductCar = 1;
    `);

  // se regresa la orden creada y el detalle de productos
  res.status(201).json({
    success: true,
    message: "Orden creada exitosamente",
    order: {
      idOrder: idOrder,
      client: req.body.client,
      address: req.body.address,
      total: req.body.total,
      typePayment: idTypePayment,
      products: cartItems.map((item) => ({
        idProduct: item.idProduct,
        quantity: item.quantity,
        priceProduct: item.priceProduct,
        subtotal: item.quantity * item.priceProduct,
      })),
    },
  });
};

export const Product = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("quantity", sql.Int, req.body.quantity)
    .input("status", sql.Int, req.body.status)
    .query(
      "UPDATE H2O.CART_SHOPPING SET quantity = @quantity, idStatusProductCar = @status WHERE idCarShoping = @id"
    );
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "product not found not updated" });
  }
  return res.status(201).json({
    message: "product updated",
    id: req.params.id,
    quantity: req.body.quantity,
    status: req.body.status,
  });
};

export const ordersStatus = async (req, res) => {
  try {
    const pool = await getConnection();

    const st = Number(req.body.estatus);
    let result;

    if (st === 0) {
      result = await pool
        .request()
        .input("fecha", sql.Date, req.body.fecha) // Fecha como parámetro
        .input("status", sql.Int, req.body.estatus) // Estado de la orden como parámetro
        .execute(`H2O.STP_LIST_ORDERS_ALL_ADMIN`);
    } else if (st === 1) {
      result = await pool
        .request()
        .input("status", sql.Int, req.body.estatus) // Estado de la orden como parámetro
        .execute(`H2O.STP_LIST_ORDERS_BY_STATUS`);
    } else if (st === 8) {
      result = await pool
        .request()
        .execute(`H2O.STP_LIST_ORDERS_DEBT_ALL`);
    } else {
      result = await pool
        .request()
        .input("fecha", sql.Date, req.body.fecha) // Fecha como parámetro
        .input("status", sql.Int, req.body.estatus) // Estado de la orden como parámetro
        .execute(`H2O.STP_LIST_ORDERS_BY_DAY_STATUS`);
    }
    // Consulta para obtener las órdenes con fecha y estado

    // Verificar si se encontraron resultados
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for the given date and status" });
    }

    // Agrupar las órdenes por `idOrder`
    const groupedOrders = result.recordset.reduce((acc, order) => {
      // Buscar si la orden ya existe en el acumulador
      const existingOrder = acc.find((o) => o.idOrder === order.idOrder);

      if (existingOrder) {
        // Si la orden ya existe, agregar el producto a los detalles de productos
        existingOrder.productDetails.push({
          nameProduct: order.nameProduct,
          urlImage: order.urlImage,
          quantity: order.quantity,
          priceProduct: order.priceProduct,
          subtotal: order.subtotal,
        });
      } else {
        // Si la orden no existe, crear una nueva orden con el primer producto
        acc.push({
          idOrder: order.idOrder,
          nameComplete: order.nameComplete,
          nameOrderStatus: order.nameOrderStatus,
          commentOrder: order.commentOrder,
          comentarioAdministrador: order.commentOrderAdmin,
          comentarioRepartidor: order.commentOrderDelivery,
          dateOrder: order.dateOrder,
          estadoPago: order.nameStatusPayment,
          address: order.address,
          productDetails: [
            {
              nameProduct: order.nameProduct,
              urlImage: order.urlImage,
              quantity: order.quantity,
              priceProduct: order.priceProduct,
              subtotal: order.subtotal,
            },
          ],
          total: order.total,
        });
      }

      return acc;
    }, []);

    // Contamos el número total de órdenes únicas
    const totalOrders = groupedOrders.length;

    // Devolver el JSON con el número total de órdenes y las órdenes
    return res.status(200).json({
      success: true,
      message: "Lista de ordenes",
      data: {
        totalOrders: totalOrders, // Total de órdenes únicas
        orders: groupedOrders, // Detalles de las órdenes
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

export const listOrdersAdmin = async (req, res) => {
  try {
    const pool = await getConnection();

    // Consulta para obtener las órdenes con fecha y estado
    const result = await pool
      .request()
      .input("fecha", sql.Date, req.body.fecha) // Fecha como parámetro
      .input("status", sql.Int, req.body.estatus) // Estado de la orden como parámetro
      .query(`
        SELECT
    O.idOrder,
    CONCAT_WS(' ', CD.nameClient, CD.firtsLastNameClient, CD.secondLastNameClient) AS nameComplete,
    UT.nameType,
    OS.nameOrderStatus, FORMAT(O.dateOrder, 'yyyy-MM-dd') AS dateOrder, FORMAT(OSH.dateOrderStatusHistory, 'yyyy-MM-dd HH:mm') AS dateOrderStatus
FROM H2O.ORDERS O
 INNER JOIN H2O.ORDERS_STATUS_HISTORY OSH ON O.idOrder = OSH.idOrder AND O.idOrderStatus = OSH.idOrderStatus
    INNER JOIN H2O.ORDERS_STATUS OS ON O.idOrderStatus = OS.idOrderStatus
    INNER JOIN H2O.CLIENTS_DATA CD ON O.idClient = CD.idClient
    INNER JOIN H2O.USERS U ON CD.idUser = U.idUser
    INNER JOIN H2O.USERS_TYPE UT ON U.idTypeUser = UT.idTypeUser
              WHERE CAST(OSH.dateOrderStatusHistory AS DATE) = @fecha 
              AND (@status = 0 OR O.idOrderStatus = @status);`);

    // Verificar si se encontraron resultados
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for the given date and status" });
    }

    // Devolver el JSON con el número total de órdenes y las órdenes
    return res.status(200).json({
      success: true,
      message: "Lista de ordenes",
      data: result.recordset,
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

export const detailOrder = async (req, res) => {
  try {
    const pool = await getConnection();

    // Consulta para obtener las órdenes con fecha y estado
    const result = await pool
      .request()
      .input("idOrder", sql.Int, req.params.idOrder) // Fecha como parámetro
      .query(` SELECT
        O.idOrder,
        CONCAT_WS(' ', CD.nameClient, CD.firtsLastNameClient, CD.secondLastNameClient) AS nameComplete,
        UT.nameType,
        OS.nameOrderStatus, FORMAT(O.dateOrder, 'yyyy-MM-dd HH:mm') AS dateOrder, P.urlImage,
        CASE 
        WHEN O.dateDelivery IS NULL THEN 'Sin Fecha' 
        ELSE FORMAT(O.dateDelivery, 'yyyy-MM-dd HH:mm') 
    END AS dateDelivery,
        CA.descriptionAddress,
        CASE 
        WHEN O.commentOrder IS NULL THEN ''
        ELSE O.commentOrder
        END AS commentOrder,
        CASE 
        WHEN O.commentOrderAdmin IS NULL THEN ''
        ELSE O.commentOrderAdmin
        END AS commentOrderAdmin,
        CASE 
        WHEN O.commentOrderDelivery IS NULL THEN '' 
        ELSE O.commentOrderDelivery
        END AS commentOrderDelivery,
        CONCAT_WS(' ', CA.street, CA.outerNumber, CA.insideNumber, ZC.colonia, ZC.ciudad, ZC.estado, ZC.zipCode) AS address,
        P.nameProduct, OD.quantity, OD.priceProduct, OD.subtotal, O.total, OSP.nameStatusPayment
    FROM H2O.ORDERS O
        INNER JOIN H2O.ORDERS_DETAIL OD ON O.idOrder = OD.idOrder
        INNER JOIN H2O.ORDERS_TYPE_PAYMENT OTP ON O.idTypePayment = OTP.idTypePayment
        INNER JOIN H2O.ORDERS_STATUS_PAYMENT OSP ON O.idStatusPayment = OSP.idStatusPayment
        INNER JOIN H2O.ORDERS_STATUS OS ON O.idOrderStatus = OS.idOrderStatus
        INNER JOIN H2O.PRODUCTS P ON OD.idProduct = P.idProduct
        INNER JOIN H2O.CLIENTS_ADREESSES CA ON O.idAddress = CA.idAddress
        INNER JOIN H2O.ZIP_CODE ZC ON CA.idZipCode = ZC.idZipCode
        INNER JOIN H2O.CLIENTS_DATA CD ON O.idClient = CD.idClient
        INNER JOIN H2O.USERS U ON CD.idUser = U.idUser
        INNER JOIN H2O.USERS_TYPE UT ON U.idTypeUser = UT.idTypeUser
    WHERE O.idOrder = @idOrder
`);

    // Verificar si se encontraron resultados
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for the given date and status" });
    }

    // Devolver el JSON con el número total de órdenes y las órdenes
    return res.status(200).json({
      success: true,
      message: "Lista de ordenes",
      data: {
        idOrder: result.recordset[0].idOrder,
        folio: result.recordset[0].idOrder,
        cliente: result.recordset[0].nameComplete,
        estadoOrden: result.recordset[0].nameOrderStatus,
        fecha: result.recordset[0].dateOrder,
        fechaEntrega: result.recordset[0].dateDelivery,
        nombreDireccion: result.recordset[0].descriptionAddress,
        direccion: result.recordset[0].address,
        total: result.recordset[0].total,
        estadoPago: result.recordset[0].nameStatusPayment,
        comentario: result.recordset[0].commentOrder,
        comentarioAdministrador: result.recordset[0].commentOrderAdmin,
        comentarioRepartidor: result.recordset[0].commentOrderDelivery,
        productos: result.recordset.map((row) => ({
          nombre: row.nameProduct,
          cantidad: row.quantity,
          precio: row.priceProduct,
          subtotal: row.subtotal,
          urlImage: row.urlImage,
        })),
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .query(
      `UPDATE H2O.ORDERS
      SET idOrderStatus = 6
      WHERE idOrder = @idOrder`
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "order not found not canceled" });
  }

  //Insertar el registro en el historial
  //  De aacuerdo al catalogo
  // 1	pendiente	Orden pendiente de aceptación por el personal de la planta purificadora
  // 2	aceptada	Orden aceptada por la planta purificadora
  // 3	en camino	Orden esta en camino para su entrega
  // 4	entregado	Orden entregada en la dirección indica
  // 5	cancelada	Orden rechazada por el personal de la planta purificadora
  // 6	cancelada por cliente	El cliente canceló la orden
  // 7	no entregada	Orden que el repartidor marco que no entrego por algun motivo
  const idOrder = req.body.idOrder;
  const idOrderStatus = 6;
  const idStaff = 0;

  const updateHistroyOrder = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idOrderStatus", sql.Int, idOrderStatus)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO  H2O.ORDERS_STATUS_HISTORY (idOrder, idOrderStatus, dateOrderStatusHistory, idStaff)
     VALUES (@idOrder, @idOrderStatus, GETDATE(), @idStaff)`
    );

  if (updateHistroyOrder.rowsAffected[0] === 0) {
    console.log("error de history");
  }

  return res.status(201).json({
    success: true,
    message: "orden cancelada por el usuario",
    data: {},
  });
};

export const undeliveredOrder = async (req, res) => {
  const pool = await getConnection();

  //Obtener idStaff
  const staff = await pool
    .request()
    .input("idUser", sql.Int, req.body.idUser)
    .query(`SELECT * FROM H2O.STAFF_COMPANY WHERE idUser = @idUser`);

  const result = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .input("commentOrder", sql.NVarChar, req.body.commentOrder)
    .input("statusPago", sql.Int, req.body.statusPago)
    .query(
      `UPDATE H2O.ORDERS
      SET idOrderStatus = 7, commentOrderDelivery = @commentOrder, idStatusPayment = @statusPago
      WHERE idOrder = @idOrder`
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "order not found not delivery" });
  }

  //Insertar el registro en el historial
  //  De aacuerdo al catalogo
  // 1	pendiente	Orden pendiente de aceptación por el personal de la planta purificadora
  // 2	aceptada	Orden aceptada por la planta purificadora
  // 3	en camino	Orden esta en camino para su entrega
  // 4	entregado	Orden entregada en la dirección indica
  // 5	cancelada	Orden rechazada por el personal de la planta purificadora
  // 6	cancelada por cliente	El cliente canceló la orden
  // 7	no entregada	Orden que el repartidor marco que no entrego por algun motivo
  const idOrder = req.body.idOrder;
  const idOrderStatus = 7;
  const idStaff = staff.recordset[0].idStaff;

  const updateHistroyOrder = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idOrderStatus", sql.Int, idOrderStatus)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO  H2O.ORDERS_STATUS_HISTORY (idOrder, idOrderStatus, dateOrderStatusHistory, idStaff)
     VALUES (@idOrder, @idOrderStatus, GETDATE(), @idStaff)`
    );

  if (updateHistroyOrder.rowsAffected[0] === 0) {
    console.log("error de history");
  }

  // Actualizar pago
  const idStatusPayment = req.body.statusPago;

  if (idStatusPayment === 1) {
    const updateHistroyPayment = await pool
      .request()
      .input("idOrder", sql.Int, idOrder)
      .input("idStatusPayment", sql.Int, idStatusPayment)
      .input("idStaff", sql.Int, idStaff)
      .query(
        `INSERT INTO H2O.ORDERS_PAYMENT_HISTORY (idOrder, idStatusPayment, dateStatusPayment, idStaff)
          VALUES(@idOrder, @idStatusPayment, GETDATE(), @idStaff)`
      );
  }

  const result2 = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .query(`SELECT * FROM H2O.ORDERS WHERE idOrder = @idOrder`);

  return res.status(201).json({
    success: true,
    message: "orden entregada por la planta",
    data: result2.recordset,
  });
};

export const deliveryOrder = async (req, res) => {
  const pool = await getConnection();

  //Obtener idStaff
  const staff = await pool
    .request()
    .input("idUser", sql.Int, req.body.idUser)
    .query(`SELECT * FROM H2O.STAFF_COMPANY WHERE idUser = @idUser`);

  const result = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .input("commentOrder", sql.NVarChar, req.body.commentOrder)
    .input("statusPago", sql.Int, req.body.statusPago)
    .query(
      `UPDATE H2O.ORDERS
      SET idOrderStatus = 4, commentOrderDelivery = @commentOrder, idStatusPayment = @statusPago
      WHERE idOrder = @idOrder`
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "order not found not delivery" });
  }

  //Insertar el registro en el historial
  //  De aacuerdo al catalogo
  // 1	pendiente	Orden pendiente de aceptación por el personal de la planta purificadora
  // 2	aceptada	Orden aceptada por la planta purificadora
  // 3	en camino	Orden esta en camino para su entrega
  // 4	entregado	Orden entregada en la dirección indica
  // 5	cancelada	Orden rechazada por el personal de la planta purificadora
  // 6	cancelada por cliente	El cliente canceló la orden
  // 7	no entregada	Orden que el repartidor marco que no entrego por algun motivo
  const idOrder = req.body.idOrder;
  const idOrderStatus = 4;
  const idStaff = staff.recordset[0].idStaff;

  const updateHistroyOrder = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idOrderStatus", sql.Int, idOrderStatus)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO  H2O.ORDERS_STATUS_HISTORY (idOrder, idOrderStatus, dateOrderStatusHistory, idStaff)
     VALUES (@idOrder, @idOrderStatus, GETDATE(), @idStaff)`
    );

  if (updateHistroyOrder.rowsAffected[0] === 0) {
    console.log("error de history");
  }

  // Actualizar pago
  const idStatusPayment = req.body.statusPago;

  if (idStatusPayment === 1) {
    const updateHistroyPayment = await pool
      .request()
      .input("idOrder", sql.Int, idOrder)
      .input("idStatusPayment", sql.Int, idStatusPayment)
      .input("idStaff", sql.Int, idStaff)
      .query(
        `INSERT INTO H2O.ORDERS_PAYMENT_HISTORY (idOrder, idStatusPayment, dateStatusPayment, idStaff)
          VALUES(@idOrder, @idStatusPayment, GETDATE(), @idStaff)`
      );
  }

  const result2 = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .query(`SELECT * FROM H2O.ORDERS WHERE idOrder = @idOrder`);

  return res.status(201).json({
    success: true,
    message: "orden entregada por la planta",
    data: result2.recordset,
  });
};

export const updateStatusPayment = async (req, res) => {
  const pool = await getConnection();

  const existStaff = await pool
    .request()
    .input("idUser", sql.Int, req.body.idUser)
    .query(" SELECT * FROM H2O.STAFF_COMPANY WHERE idUser = @idUser");
  const idStaff = existStaff.recordset[0].idStaff;

  const result = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .input("idStatusPayment", sql.Int, req.body.idStatus)
    .input("idStaff", sql.Int, idStaff).query(`
      INSERT INTO H2O.ORDERS_PAYMENT_HISTORY (idOrder, idStatusPayment, dateStatusPayment, idStaff)
      VALUES(@idOrder, @idStatusPayment, GETDATE(), @idStaff); 
      UPDATE H2O.ORDERS SET idStatusPayment = @idStatusPayment WHERE idOrder = @idOrder 
      `);

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "no fue posible actulizar el status de pago",
      data: {},
    });
  }

  return res.status(201).json({
    success: true,
    message: "estatus actualizado",
    data: {},
  });
};

export const autoriceOrder = async (req, res) => {
  const pool = await getConnection();

  //Obtener idStaff
  const staff = await pool
    .request()
    .input("idUser", sql.Int, req.body.idUser)
    .query(`SELECT * FROM H2O.STAFF_COMPANY WHERE idUser = @idUser`);

  const result = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .input("commentOrder", sql.NVarChar, req.body.commentOrder)
    .query(
      `UPDATE H2O.ORDERS
      SET idOrderStatus = 2, commentOrderAdmin = @commentOrder
      WHERE idOrder = @idOrder`
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "order not found no actualizada" });
  }

  //Insertar el registro en el historial
  //  De aacuerdo al catalogo
  // 1	pendiente	Orden pendiente de aceptación por el personal de la planta purificadora
  // 2	aceptada	Orden aceptada por la planta purificadora
  // 3	en camino	Orden esta en camino para su entrega
  // 4	entregado	Orden entregada en la dirección indica
  // 5	cancelada	Orden rechazada por el personal de la planta purificadora
  // 6	cancelada por cliente	El cliente canceló la orden
  // 7	no entregada	Orden que el repartidor marco que no entrego por algun motivo
  const idOrder = req.body.idOrder;
  const idOrderStatus = 2;
  const idStaff = staff.recordset[0].idStaff;

  const updateHistroyOrder = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idOrderStatus", sql.Int, idOrderStatus)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO  H2O.ORDERS_STATUS_HISTORY (idOrder, idOrderStatus, dateOrderStatusHistory, idStaff)
     VALUES (@idOrder, @idOrderStatus, GETDATE(), @idStaff)`
    );

  if (updateHistroyOrder.rowsAffected[0] === 0) {
    console.log("error de history");
  }

  return res.status(201).json({
    success: true,
    message: "orden autorizada por la planta",
    data: {},
  });
};

export const rejectedOrder = async (req, res) => {
  const pool = await getConnection();

  //Obtener idStaff
  const staff = await pool
    .request()
    .input("idUser", sql.Int, req.body.idUser)
    .query(`SELECT * FROM H2O.STAFF_COMPANY WHERE idUser = @idUser`);

  const result = await pool
    .request()
    .input("idOrder", sql.Int, req.body.idOrder)
    .input("commentOrder", sql.NVarChar, req.body.commentOrder)
    .query(
      `UPDATE H2O.ORDERS
      SET idOrderStatus = 5, commentOrderAdmin = @commentOrder
      WHERE idOrder = @idOrder`
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "order not found not canceled" });
  }

  //Insertar el registro en el historial
  //  De aacuerdo al catalogo
  // 1	pendiente	Orden pendiente de aceptación por el personal de la planta purificadora
  // 2	aceptada	Orden aceptada por la planta purificadora
  // 3	en camino	Orden esta en camino para su entrega
  // 4	entregado	Orden entregada en la dirección indica
  // 5	cancelada	Orden rechazada por el personal de la planta purificadora
  // 6	cancelada por cliente	El cliente canceló la orden
  // 7	no entregada	Orden que el repartidor marco que no entrego por algun motivo
  const idOrder = req.body.idOrder;
  const idOrderStatus = 5;
  const idStaff = staff.recordset[0].idStaff;

  const updateHistroyOrder = await pool
    .request()
    .input("idOrder", sql.Int, idOrder)
    .input("idOrderStatus", sql.Int, idOrderStatus)
    .input("idStaff", sql.Int, idStaff)
    .query(
      `INSERT INTO  H2O.ORDERS_STATUS_HISTORY (idOrder, idOrderStatus, dateOrderStatusHistory, idStaff)
     VALUES (@idOrder, @idOrderStatus, GETDATE(), @idStaff)`
    );

  if (updateHistroyOrder.rowsAffected[0] === 0) {
    console.log("error de history");
  }

  return res.status(201).json({
    success: true,
    message: "orden rechazada por la planta purificadora",
    data: {},
  });
};

export const listOrdersByClient = async (req, res) => {
  try {
    const pool = await getConnection();

    // Consulta para obtener las órdenes con fecha y estado
    const result = await pool
      .request()
      .input("idClient", sql.Int, req.params.idClient) // Fecha como parámetro
      .query(`SELECT
    O.idOrder,
    O.idOrder AS folio,
    FORMAT(O.dateOrder, 'yyyy-MM-dd') AS dateOrder,
    CA.descriptionAddress,
     CASE 
        WHEN O.dateDelivery IS NULL THEN 'Sin Fecha' 
        ELSE FORMAT(O.dateDelivery, 'yyyy-MM-dd') 
    END AS dateDelivery,
    CONCAT_WS(' ', CD.nameClient, CD.firtsLastNameClient, CD.secondLastNameClient) AS nameComplete,
    OS.nameOrderStatus,
    O.total
FROM H2O.ORDERS O
    INNER JOIN H2O.ORDERS_STATUS OS ON O.idOrderStatus = OS.idOrderStatus
    INNER JOIN H2O.CLIENTS_DATA CD ON O.idClient = CD.idClient
    INNER JOIN H2O.USERS U ON CD.idUser = U.idUser
    INNER JOIN H2O.CLIENTS_ADREESSES CA ON O.idAddress = CA.idAddress
    INNER JOIN H2O.ZIP_CODE ZC ON CA.idZipCode = ZC.idZipCode
WHERE O.idClient = @idClient`);

    // Verificar si se encontraron resultados
    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for the given date and status" });
    }

    // Devolver el JSON con el número total de órdenes y las órdenes
    return res.status(200).json({
      success: true,
      message: "Lista de ordenes",
      data: result.recordset,
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

export const listOrdersDebtByClient = async (req, res) => {
  try {
    const pool = await getConnection();

    // Consulta para obtener las órdenes con fecha y estado
    const result = await pool
      .request()
      .input("idClient", sql.Int, req.params.idClient) // Fecha como parámetro
      .execute(`H2O.STP_LIST_ORDERS_DEBT_BY_CLIENT`);

    const orders = result.recordset;

    // Verificar si se encontraron resultados
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the given date and status",
        data: {},
      });
    }

    // Calcular el total de deuda
    const totalDebt = orders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    // Devolver el JSON con el número total de órdenes y las órdenes
    return res.status(200).json({
      success: true,
      message: "Lista de ordenes",
      data: {
        totalDebt: totalDebt,
        listOrders: result.recordset,
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};

export const listOrdersDebtForAdmin = async (req, res) => {
  try {
    const pool = await getConnection();

    // Consulta para obtener las órdenes con fecha y estado
    const result = await pool.request().execute(`H2O.STP_LIST_ORDERS_DEBT_ALL`);

    const orders = result.recordset;

    // Verificar si se encontraron resultados
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the given date and status",
        data: {},
      });
    }

    // Calcular el total de deuda
    const totalDebt = orders.reduce(
      (sum, order) => sum + parseFloat(order.total),
      0
    );

    // Devolver el JSON con el número total de órdenes y las órdenes
    return res.status(200).json({
      success: true,
      message: "Lista de ordenes",
      data: {
        totalDebt: totalDebt,
        listOrders: result.recordset,
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      message: "An error occurred while fetching orders",
      error: error.message,
    });
  }
};
