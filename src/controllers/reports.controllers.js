import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const getDashboard = async (req, res) => {
  const st = 2;

  const pool = await getConnection();
  const sales = await pool
    .request()
    .input("fecha", sql.NVarChar, req.params.date)
    .input("status", sql.Int, st)
    .execute(`H2O.STP_LIST_ORDERS_BY_DAY_STATUS`);
  console.log(sales.recordset);

  // Verifica si 'sales.recordset' tiene datos
  if (sales.recordset.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No se encontraron ventas para la fecha proporcionada",
      data: {},
    });
  }

  // Inicializamos variables para totalVentas, tipos de productos y tipos de clientes
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
    "cliente departamento": 0,
  };

  // Procesamos los resultados de las ventas
  sales.recordset.forEach((order) => {
    totalVentas += order.total; // Sumar total de ventas

    // Contamos los tipos de productos vendidos
    if (productosVendidos[order.nameProduct] !== undefined) {
        productosVendidos[order.nameProduct] += order.quantity;
    }

    // Contamos el número de pedidos por tipo de cliente
    if (pedidosCliente[order.nameType] !== undefined) {
        pedidosCliente[order.nameType] += 1;
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
