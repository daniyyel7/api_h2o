import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const getDashboardAnteror = async (req, res) => {
  const st = 4;

  const pool = await getConnection();
  const sales = await pool
    .request()
    .input("fecha", sql.NVarChar, req.params.date)
    .input("status", sql.Int, st)
    .execute(`H2O.STP_DASHBOARD`);
  console.log(sales);

  // Inicializamos variables para total Ventas, tipos de productos y tipos de clientes
  let totalVentas = 0;
  let productosVendidos = {
    "Garrafón lleno": 0,
    "Garrafón vacio": 0,
    "Botella": 0,
    "Paquete de botellas": 0,
  };
  let pedidosCliente = {
    "cliente publico general": 0,
    "cliente institucional": 0,
    "cliente mayoreo": 0,
    "Cliente Departamento": 0,
    "sin ventas": 1,
  };

  const pedidosContados = new Set();

  // Verifica si 'sales.recordset' tiene datos
  if (sales.recordset.length === 0) {
    return res.status(404).json({
      success: true,
      message: "No se encontraron ventas para la fecha proporcionada",
      data: {
        totalVentas,
        productosVendidos,
        pedidosCliente,
      },
    });
  }

  pedidosCliente = {
    "cliente publico general": 0,
    "cliente institucional": 0,
    "cliente mayoreo": 0,
    "cliente departamento": 0,
    "sin ventas": 0,
  };
  // Procesamos los resultados de las ventas
  sales.recordset.forEach((order) => {
    totalVentas += order.subtotal; // Sumar total de ventas

    // Contamos los tipos de productos vendidos
    if (productosVendidos[order.nameProduct] !== undefined) {
      productosVendidos[order.nameProduct] += order.quantity;
    }

    // Contamos el número de pedidos por tipo de cliente
    if (!pedidosContados.has(order.idOrder)) {
      pedidosContados.add(order.idOrder);

      if (pedidosCliente[order.nameType] !== undefined) {
        pedidosCliente[order.nameType] += 1;
      }
    }
  });

  return res.status(200).json({
    success: true,
    message: "Ventas del día",
    data: {
      totalVentas,
      productosVendidos,
      pedidosCliente,
    },
  });
};


export const getDashboard = async (req, res) => {
  const st = 4;
  const pool = await getConnection();

  // Obtener productos activos
  const productosResult = await pool
    .request()
    .query(`SELECT nameProduct FROM H2O.PRODUCTS WHERE idStatusProduct = 1`);

  const productosVendidos = {};
  productosResult.recordset.forEach(row => {
    productosVendidos[row.nameProduct] = 0;
  });

  // Obtener tipos de cliente activos (sin STAFF)
  const clientesResult = await pool
    .request()
    .query(`SELECT nameType FROM H2O.USERS_TYPE WHERE idStatusType = 1 AND typeUser NOT LIKE '%STAFF%'`);

  const pedidosCliente = {};
  clientesResult.recordset.forEach(row => {
    const tipo = row.nameType.trim().toLowerCase();
    pedidosCliente[tipo] = 0;
  });

  // Llamada al SP de ventas
  const sales = await pool
    .request()
    .input("fecha", sql.NVarChar, req.params.date)
    .input("status", sql.Int, st)
    .execute(`H2O.STP_DASHBOARD`);

  let totalVentas = 0;
  const pedidosContados = new Set();
  const sinVentas = sales.recordset.length === 0 ? 1 : 0;

  // Agregar "sin ventas" como tipo de cliente especial
  pedidosCliente["sin ventas"] = sinVentas;

  // Calcular deuda
  const deudaResult = await pool.request().query(`
    SELECT SUM(O.total) AS deuda
    FROM H2O.ORDERS O
    WHERE O.idStatusPayment = 0 AND O.idOrderStatus = 4
  `);
  const deuda = deudaResult.recordset[0].deuda || 0;

  if (sinVentas) {
    return res.status(404).json({
      success: true,
      message: "No se encontraron ventas para la fecha proporcionada",
      data: {
        totalVentas,
        productosVendidos,
        pedidosCliente,
        deuda,
      },
    });
  }

  // Procesar las ventas
  sales.recordset.forEach((order) => {
    totalVentas += order.subtotal;

    if (productosVendidos.hasOwnProperty(order.nameProduct)) {
      productosVendidos[order.nameProduct] += order.quantity;
    }

    if (!pedidosContados.has(order.idOrder)) {
      pedidosContados.add(order.idOrder);

      const tipo = order.nameType.trim().toLowerCase();
      if (pedidosCliente.hasOwnProperty(tipo)) {
        pedidosCliente[tipo] += 1;
      }
    }
  });

  return res.status(200).json({
    success: true,
    message: "Ventas del día",
    data: {
      totalVentas,
      productosVendidos,
      pedidosCliente,
      deuda,
    },
  });
};


export const getOrdersReportByPayment = async (req, res) => {
  const { fechaInicio, fechaFin, idTypePayment, idStatusPayment } = req.body;

  if (!fechaInicio || !fechaFin || idTypePayment === undefined || idStatusPayment === undefined) {
    return res.status(400).json({
      success: false,
      message: "Debe proporcionar fechaInicio, fechaFin, idTypePayment e idStatusPayment",
    });
  }

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("fechaInicio", sql.Date, fechaInicio)
      .input("fechaFin", sql.Date, fechaFin)
      .input("idTypePayment", sql.Int, idTypePayment)
      .input("idStatusPayment", sql.Int, idStatusPayment)
      .query(`
        SELECT 
          ROW_NUMBER() OVER (ORDER BY OSH.dateOrderStatusHistory ASC) AS numero_item,
          FORMAT(O.dateOrder, 'yyyy-MM-dd') AS dateCreateOrder,
          FORMAT(OPH.dateStatusPayment, 'yyyy-MM-dd') AS dataSale,
          CONCAT_WS(' ', CD.nameClient, CD.firtsLastNameClient, CD.secondLastNameClient) AS nameClient,
          O.idOrder AS folio,
          O.total AS monto
        FROM H2O.ORDERS O
          INNER JOIN H2O.ORDERS_STATUS_HISTORY OSH 
            ON O.idOrder = OSH.idOrder AND O.idOrderStatus = OSH.idOrderStatus
          INNER JOIN H2O.ORDERS_TYPE_PAYMENT OTP ON O.idTypePayment = OTP.idTypePayment
          INNER JOIN H2O.CLIENTS_DATA CD ON O.idClient = CD.idClient
          INNER JOIN H2O.ORDERS_PAYMENT_HISTORY OPH 
            ON O.idOrder = OPH.idOrder AND O.idStatusPayment = OPH.idStatusPayment
        WHERE 
          O.idTypePayment = @idTypePayment 
          AND O.idStatusPayment = @idStatusPayment
          AND O.idOrderStatus = 4
          AND CONVERT(DATE, OPH.dateStatusPayment) BETWEEN @fechaInicio AND @fechaFin
      `);

    const datos = result.recordset;

    const totalGeneral = datos.reduce((sum, item) => sum + parseFloat(item.monto), 0);

    res.status(200).json({
      success: true,
      message: "Reporte generado exitosamente",
      totalGeneral,
      data: datos
    });

  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el reporte",
    });
  }
};


