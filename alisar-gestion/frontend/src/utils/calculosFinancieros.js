/**
 * Utilidades de Cálculo Financiero
 * Funciones puras para cálculos de presupuesto, gastos y ganancias
 */

/**
 * Calcula el presupuesto según el tipo
 * @param {string} tipo - 'fijo' o 'tarifa'
 * @param {number} valor - Presupuesto fijo o tarifa por km
 * @param {number} km - Kilómetros (requerido si tipo es 'tarifa')
 * @returns {number} Presupuesto calculado
 */
export const calcularPresupuesto = (tipo, valor, km = 0) => {
  if (tipo === 'tarifa' && km > 0) {
    return valor * km;
  }
  return tipo === 'fijo' ? valor : 0;
};

/**
 * Calcula los impuestos (16% del presupuesto)
 * @param {number} presupuesto - Presupuesto bruto
 * @returns {number} Impuestos al 16%
 */
export const calcularImpuestos = (presupuesto) => {
  return presupuesto * 0.16;
};

/**
 * Calcula el presupuesto neto (bruto - impuestos)
 * @param {number} presupuestoBruto - Presupuesto antes de impuestos
 * @returns {number} Presupuesto neto
 */
export const calcularPresupuestoNeto = (presupuestoBruto) => {
  const impuestos = calcularImpuestos(presupuestoBruto);
  return presupuestoBruto - impuestos;
};

/**
 * Calcula el costo total de diesel
 * @param {number} litros - Cantidad de litros
 * @param {number} precioPorLitro - Precio por litro en Bs
 * @returns {number} Gasto total en diesel
 */
export const calcularGastoDiesel = (litros, precioPorLitro) => {
  return litros * precioPorLitro;
};

/**
 * Calcula el costo total de personal
 * @param {Array} empleados - Array de empleados con {cantidad, salario, dias}
 * @returns {number} Gasto total de personal
 */
export const calcularGastoPersonal = (empleados) => {
  if (!Array.isArray(empleados) || empleados.length === 0) {
    return 0;
  }

  return empleados.reduce((total, emp) => {
    const cantidad = emp.cantidad || 0;
    const salario = emp.salario || 0;
    const dias = emp.dias || 1;
    return total + (cantidad * salario * dias);
  }, 0);
};

/**
 * Calcula el costo total de comida
 * @param {number} costoTotal - Costo total o
 * @param {number} dias - Número de días (alternativo)
 * @param {number} costoPorDia - Costo por día (alternativo)
 * @returns {number} Gasto total en comida
 */
export const calcularGastoComida = (costoTotal = 0, dias = 0, costoPorDia = 0) => {
  if (costoTotal > 0) {
    return costoTotal;
  }
  return dias * costoPorDia;
};

/**
 * Calcula el costo de mantenimiento de maquinaria
 * @param {number} cantidadMaquinas - Cantidad de máquinas
 * @param {number} costoPorMaquina - Costo por máquina en Bs
 * @returns {number} Gasto total de mantenimiento
 */
export const calcularGastoMantenimiento = (cantidadMaquinas, costoPorMaquina) => {
  return cantidadMaquinas * costoPorMaquina;
};

/**
 * Calcula el gasto total del proyecto
 * @param {object} gastos - Objeto con todos los gastos
 * @returns {number} Gasto total
 */
export const calcularGastoTotal = (gastos) => {
  const {
    diesel = 0,
    personal = 0,
    comida = 0,
    mantenimiento = 0,
    otros = 0
  } = gastos || {};

  return diesel + personal + comida + mantenimiento + otros;
};

/**
 * Calcula la ganancia neta del proyecto
 * @param {number} presupuestoNeto - Presupuesto neto (bruto - impuestos)
 * @param {number} gastoTotal - Gasto total operativo
 * @returns {number} Ganancia neta
 */
export const calcularGanancia = (presupuestoNeto, gastoTotal) => {
  return presupuestoNeto - gastoTotal;
};

/**
 * Calcula el margen de ganancia en porcentaje
 * @param {number} ganancia - Ganancia neta
 * @param {number} presupuestoBruto - Presupuesto bruto (para referencia)
 * @returns {number} Margen en porcentaje
 */
export const calcularMargen = (ganancia, presupuestoBruto) => {
  if (presupuestoBruto <= 0) return 0;
  return (ganancia / presupuestoBruto) * 100;
};

/**
 * Calcula la ganancia por kilómetro
 * @param {number} ganancia - Ganancia neta
 * @param {number} km - Kilómetros totales
 * @returns {number} Ganancia por km
 */
export const calcularGananciaPortKm = (ganancia, km) => {
  if (km <= 0) return 0;
  return ganancia / km;
};

/**
 * Calcula la ganancia por día
 * @param {number} ganancia - Ganancia neta
 * @param {number} dias - Días totales
 * @returns {number} Ganancia por día
 */
export const calcularGananciaPortDia = (ganancia, dias) => {
  if (dias <= 0) return 0;
  return ganancia / dias;
};

/**
 * Calcula todo el resumen financiero de un proyecto
 * @param {object} proyecto - Objeto con datos del proyecto
 * @returns {object} Resumen completo con todos los cálculos
 */
export const calcularResumenFinanciero = (proyecto) => {
  const {
    tipo_presupuesto = 'fijo',
    presupuesto_adjudicado = 0,
    kilometros_totales = 0,
    tarifa_km = 23000,
    duracion_dias = 1,
    diesel_litros = 0,
    diesel_precio = 9.8,
    empleados = [],
    gasto_comida = 0,
    dias_comida = 0,
    costo_comida_dia = 0,
    cantidad_maquinas = 0,
    costo_mantenimiento_maquina = 0,
    gasto_otros = 0
  } = proyecto || {};

  // Calcular presupuesto
  const presupuestoBruto = calcularPresupuesto(
    tipo_presupuesto,
    presupuesto_adjudicado,
    kilometros_totales
  );

  // Calcular impuestos y presupuesto neto
  const impuestos = calcularImpuestos(presupuestoBruto);
  const presupuestoNeto = calcularPresupuestoNeto(presupuestoBruto);

  // Calcular gastos individuales
  const gastoDiesel = calcularGastoDiesel(diesel_litros, diesel_precio);
  const gastoPersonal = calcularGastoPersonal(empleados);
  const gastoComida = calcularGastoComida(
    gasto_comida > 0 ? gasto_comida : 0,
    dias_comida,
    costo_comida_dia
  );
  const gastoMantenimiento = calcularGastoMantenimiento(
    cantidad_maquinas,
    costo_mantenimiento_maquina
  );

  // Calcular gasto total
  const gastoTotal = calcularGastoTotal({
    diesel: gastoDiesel,
    personal: gastoPersonal,
    comida: gastoComida,
    mantenimiento: gastoMantenimiento,
    otros: gasto_otros
  });

  // Calcular ganancia y margen
  const gananciaNeta = calcularGanancia(presupuestoNeto, gastoTotal);
  const margenGanancia = calcularMargen(gananciaNeta, presupuestoBruto);
  const gananciaPorKm = calcularGananciaPortKm(gananciaNeta, kilometros_totales);
  const gananciaPorDia = calcularGananciaPortDia(gananciaNeta, duracion_dias);

  return {
    presupuestoBruto: Math.round(presupuestoBruto * 100) / 100,
    impuestos: Math.round(impuestos * 100) / 100,
    presupuestoNeto: Math.round(presupuestoNeto * 100) / 100,
    gastoDiesel: Math.round(gastoDiesel * 100) / 100,
    gastoPersonal: Math.round(gastoPersonal * 100) / 100,
    gastoComida: Math.round(gastoComida * 100) / 100,
    gastoMantenimiento: Math.round(gastoMantenimiento * 100) / 100,
    gastoOtros: gasto_otros,
    gastoTotal: Math.round(gastoTotal * 100) / 100,
    gananciaNeta: Math.round(gananciaNeta * 100) / 100,
    margenGanancia: Math.round(margenGanancia * 100) / 100,
    gananciaPorKm: Math.round(gananciaPorKm * 100) / 100,
    gananciaPorDia: Math.round(gananciaPorDia * 100) / 100
  };
};

export default {
  calcularPresupuesto,
  calcularImpuestos,
  calcularPresupuestoNeto,
  calcularGastoDiesel,
  calcularGastoPersonal,
  calcularGastoComida,
  calcularGastoMantenimiento,
  calcularGastoTotal,
  calcularGanancia,
  calcularMargen,
  calcularGananciaPortKm,
  calcularGananciaPortDia,
  calcularResumenFinanciero
};
