import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const createOrder = async (req, res) => {
  const pool = await getConnection();

  //Busca los productos del carrito
  const productsCar = await pool
    .request()
    .input("idClient", sql.Int, req.body.client)
    .query(
      "SELECT MCS.idProduct, MCS.quantity, PPT.price AS priceProduct FROM H2O.CART_SHOPPING MCS INNER JOIN (SELECT * FROM H2O.PRODUCTS_PRICE WHERE idTypeUser = (SELECT MUT.idTypeUser FROM H2O.CLIENTS_DATA MCD INNER JOIN H2O.USERS MU ON MCD.idUser = MU.idUser INNER JOIN H2O.USERS_TYPE MUT ON MU.idTypeUser = MUT.idTypeUser WHERE MCD.idClient = @idClient)) PPT ON MCS.idProduct = PPT.idProduct WHERE MCS.idClient = @idClient AND MCS.idStatusProductCar = 1;"
    );

  //validar que exista productos
  if (productsCar.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "products not found",
      data: "",
    });
  }

  //guarda los productos
  const cartItems = productsCar.recordset;

  //Insertar la orden
  const insertOrder = await pool
    .request()
    .input("idClient", sql.Int, req.body.client)
    .input("idAddress", sql.Int, req.body.address)
    .input("total", sql.Decimal, req.body.total)
    .input("idTypePayment", sql.Int, req.body.typepayment)
    .query(
      "INSERT INTO H2O.ORDERS ( idClient, dateOrder, idAddress, idOrderStatus, total, idTypePayment) VALUES (@idClient, GETDATE() , @idAddress, 1,@total, @idTypePayment); SELECT SCOPE_IDENTITY() AS idOrder;"
    );

  //Validar la orden se insertara correctamente
  if (insertOrder.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "error could not add order" });
  }

  //se guarda el id de la orden
  const idOrder = insertOrder.recordset[0].idOrder;

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
      typePayment: req.body.typepayment,
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

    // Consulta para obtener las órdenes con fecha y estado
    const result = await pool
      .request()
      .input("fecha", sql.Date, req.body.fecha) // Fecha como parámetro
      .input("status", sql.Int, req.body.estatus) // Estado de la orden como parámetro
      .query(`
                SELECT
                    O.idOrder,
                    CONCAT_WS(' ', CD.nameClient, CD.firtsLastNameClient, CD.secondLastNameClient) AS nameComplete,
                    OS.nameOrderStatus, FORMAT(O.dateOrder, 'yyyy-dd-MM HH:mm') AS dateOrder, 
                    CONCAT_WS(' ', CA.street, CA.outerNumber, CA.insideNumber, ZC.colonia, ZC.ciudad, ZC.estado, ZC.zipCode) AS address,
                    P.nameProduct, OD.quantity, OD.priceProduct, OD.subtotal, O.total
                FROM H2O.ORDERS O
                INNER JOIN H2O.ORDERS_DETAIL OD ON O.idOrder = OD.idOrder
                INNER JOIN H2O.ORDERS_TYPE_PAYMENT OTP ON O.idTypePayment = OTP.idTypePayment
                INNER JOIN H2O.ORDERS_STATUS OS ON O.idOrderStatus = OS.idOrderStatus
                INNER JOIN H2O.PRODUCTS P ON OD.idProduct = P.idProduct
                INNER JOIN H2O.CLIENTS_ADREESSES CA ON O.idAddress = CA.idAddress
                INNER JOIN H2O.ZIP_CODE ZC ON CA.idZipCode = ZC.idZipCode
                INNER JOIN H2O.CLIENTS_DATA CD ON O.idClient = CD.idClient
                WHERE CAST(O.dateOrder AS DATE) = @fecha AND O.idOrderStatus = @status
            `);

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
          dateOrder: order.dateOrder,
          address: order.address,
          productDetails: [
            {
              nameProduct: order.nameProduct,
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
