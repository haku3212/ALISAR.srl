/**
 * validators.js
 * Funciones de validación reutilizables para el sistema ALISAR
 * Incluye validación de cédula boliviana, teléfono, email, rangos y fechas
 */

/**
 * Valida una cédula boliviana
 * Formato: 10 dígitos sin guiones o espacios
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} true si es válida, false en caso contrario
 */
export const validateCedula = (cedula) => {
  if (!cedula) return false;
  // Eliminar espacios y guiones
  const clean = cedula.replace(/[\s-]/g, '');
  // Debe tener exactamente 10 dígitos
  return /^\d{10}$/.test(clean);
};

/**
 * Valida un número de teléfono boliviano
 * Permite: +591, 0, o 6-8 dígitos
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} true si es válido, false en caso contrario
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  // Eliminar espacios, guiones y paréntesis
  const clean = phone.replace(/[\s\-()]/g, '');
  // Debe tener 7-12 dígitos (incluyendo código país)
  return /^\d{7,12}$/.test(clean);
};

/**
 * Valida un correo electrónico
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido, false en caso contrario
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un valor esté dentro de un rango específico
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo (inclusive)
 * @param {number} max - Valor máximo (inclusive)
 * @returns {boolean} true si está dentro del rango, false en caso contrario
 */
export const validateRange = (value, min, max) => {
  if (value === null || value === undefined || value === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Valida que una fecha sea válida y no esté en el futuro
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} true si es válida y no es futura, false en caso contrario
 */
export const validateDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today && !isNaN(date.getTime());
};

/**
 * Valida que una fecha no sea anterior a otra fecha
 * @param {string} dateString - Fecha a validar (YYYY-MM-DD)
 * @param {string} minDateString - Fecha mínima permitida (YYYY-MM-DD)
 * @returns {boolean} true si dateString >= minDateString, false en caso contrario
 */
export const validateDateAfter = (dateString, minDateString) => {
  if (!dateString || !minDateString) return false;
  const date = new Date(dateString);
  const minDate = new Date(minDateString);
  return date >= minDate && !isNaN(date.getTime()) && !isNaN(minDate.getTime());
};

/**
 * Valida que un número sea positivo
 * @param {number|string} value - Valor a validar
 * @returns {boolean} true si es positivo, false en caso contrario
 */
export const validatePositive = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Valida que un número sea no-negativo (>= 0)
 * @param {number|string} value - Valor a validar
 * @returns {boolean} true si es no-negativo, false en caso contrario
 */
export const validateNonNegative = (value) => {
  if (value === null || value === undefined || value === '') return false;
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} true si no está vacío, false en caso contrario
 */
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return !!value;
};

/**
 * Valida que un porcentaje esté entre 0 y 100
 * @param {number|string} value - Valor a validar
 * @returns {boolean} true si está entre 0 y 100, false en caso contrario
 */
export const validatePercentage = (value) => {
  return validateRange(value, 0, 100);
};

/**
 * Valida que una contraseña sea segura
 * Requisitos: Al menos 8 caracteres, una mayúscula, una minúscula, un número
 * @param {string} password - Contraseña a validar
 * @returns {boolean} true si cumple los requisitos, false en caso contrario
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Obtiene un mensaje de error descriptivo para un campo
 * @param {string} fieldName - Nombre del campo
 * @param {string} validationType - Tipo de validación
 * @returns {string} Mensaje de error descriptivo
 */
export const getValidationMessage = (fieldName, validationType) => {
  const messages = {
    required: `${fieldName} es requerido`,
    email: `${fieldName} debe ser un email válido`,
    cedula: `${fieldName} debe ser una cédula válida (10 dígitos)`,
    phone: `${fieldName} debe ser un teléfono válido`,
    positive: `${fieldName} debe ser un número positivo`,
    nonNegative: `${fieldName} debe ser un número no-negativo`,
    percentage: `${fieldName} debe estar entre 0 y 100`,
    date: `${fieldName} debe ser una fecha válida`,
    password: `${fieldName} debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número`
  };
  return messages[validationType] || `${fieldName} no es válido`;
};

export default {
  validateCedula,
  validatePhone,
  validateEmail,
  validateRange,
  validateDate,
  validateDateAfter,
  validatePositive,
  validateNonNegative,
  validateRequired,
  validatePercentage,
  validatePassword,
  getValidationMessage
};
