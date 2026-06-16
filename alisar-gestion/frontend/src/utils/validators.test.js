import {
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
  getValidationMessage,
} from './validators';

// ── validateCedula ────────────────────────────────────────────────────────────

describe('validateCedula', () => {
  test('acepta cédula de 10 dígitos válida', () => {
    expect(validateCedula('1234567890')).toBe(true);
  });
  test('acepta cédula con espacios (los limpia)', () => {
    expect(validateCedula('123 456 7890')).toBe(true);
  });
  test('acepta cédula con guiones (los limpia)', () => {
    expect(validateCedula('123-456-7890')).toBe(true);
  });
  test('rechaza cédula con menos de 10 dígitos', () => {
    expect(validateCedula('123456789')).toBe(false);
  });
  test('rechaza cédula con más de 10 dígitos', () => {
    expect(validateCedula('12345678901')).toBe(false);
  });
  test('rechaza cédula con letras', () => {
    expect(validateCedula('123456789A')).toBe(false);
  });
  test('rechaza valor vacío', () => {
    expect(validateCedula('')).toBe(false);
  });
  test('rechaza null/undefined', () => {
    expect(validateCedula(null)).toBe(false);
    expect(validateCedula(undefined)).toBe(false);
  });
});

// ── validatePhone ─────────────────────────────────────────────────────────────

describe('validatePhone', () => {
  test('acepta número de 8 dígitos', () => {
    expect(validatePhone('78231456')).toBe(true);
  });
  test('acepta número de 7 dígitos', () => {
    expect(validatePhone('7823145')).toBe(true);
  });
  test('acepta número con código de país de 10 dígitos', () => {
    expect(validatePhone('5917823145')).toBe(true);
  });
  test('acepta número con paréntesis y guiones (los limpia)', () => {
    expect(validatePhone('(591) 78-231-456')).toBe(true);
  });
  test('rechaza número con menos de 7 dígitos', () => {
    expect(validatePhone('782314')).toBe(false);
  });
  test('rechaza número con más de 12 dígitos', () => {
    expect(validatePhone('7823145678901')).toBe(false);
  });
  test('rechaza valor vacío', () => {
    expect(validatePhone('')).toBe(false);
  });
  test('rechaza null', () => {
    expect(validatePhone(null)).toBe(false);
  });
});

// ── validateEmail ─────────────────────────────────────────────────────────────

describe('validateEmail', () => {
  test('acepta email válido', () => {
    expect(validateEmail('usuario@alisar.com')).toBe(true);
  });
  test('acepta email con subdominios', () => {
    expect(validateEmail('usuario@mail.alisar.com.bo')).toBe(true);
  });
  test('rechaza email sin @', () => {
    expect(validateEmail('usuarioalisar.com')).toBe(false);
  });
  test('rechaza email sin dominio', () => {
    expect(validateEmail('usuario@')).toBe(false);
  });
  test('rechaza email sin extensión', () => {
    expect(validateEmail('usuario@alisar')).toBe(false);
  });
  test('rechaza valor vacío', () => {
    expect(validateEmail('')).toBe(false);
  });
  test('rechaza null', () => {
    expect(validateEmail(null)).toBe(false);
  });
});

// ── validateRange ─────────────────────────────────────────────────────────────

describe('validateRange', () => {
  test('acepta valor en el rango', () => {
    expect(validateRange(50, 0, 100)).toBe(true);
  });
  test('acepta el valor mínimo exacto', () => {
    expect(validateRange(0, 0, 100)).toBe(true);
  });
  test('acepta el valor máximo exacto', () => {
    expect(validateRange(100, 0, 100)).toBe(true);
  });
  test('rechaza valor por debajo del mínimo', () => {
    expect(validateRange(-1, 0, 100)).toBe(false);
  });
  test('rechaza valor por encima del máximo', () => {
    expect(validateRange(101, 0, 100)).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(validateRange('', 0, 100)).toBe(false);
  });
  test('rechaza null', () => {
    expect(validateRange(null, 0, 100)).toBe(false);
  });
});

// ── validateDate ──────────────────────────────────────────────────────────────

describe('validateDate', () => {
  test('acepta fecha pasada válida', () => {
    expect(validateDate('2020-06-15')).toBe(true);
  });
  test('acepta fecha de hoy', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(validateDate(today)).toBe(true);
  });
  test('rechaza fecha futura', () => {
    expect(validateDate('2099-12-31')).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(validateDate('')).toBe(false);
  });
  test('rechaza null', () => {
    expect(validateDate(null)).toBe(false);
  });
  test('rechaza fecha inválida', () => {
    expect(validateDate('fecha-invalida')).toBe(false);
  });
});

// ── validateDateAfter ─────────────────────────────────────────────────────────

describe('validateDateAfter', () => {
  test('acepta fecha posterior a la mínima', () => {
    expect(validateDateAfter('2026-06-20', '2026-01-01')).toBe(true);
  });
  test('acepta fecha igual a la mínima', () => {
    expect(validateDateAfter('2026-01-01', '2026-01-01')).toBe(true);
  });
  test('rechaza fecha anterior a la mínima', () => {
    expect(validateDateAfter('2025-12-31', '2026-01-01')).toBe(false);
  });
  test('rechaza cuando alguna fecha es null', () => {
    expect(validateDateAfter(null, '2026-01-01')).toBe(false);
    expect(validateDateAfter('2026-06-20', null)).toBe(false);
  });
});

// ── validatePositive ──────────────────────────────────────────────────────────

describe('validatePositive', () => {
  test('acepta número positivo entero', () => {
    expect(validatePositive(5)).toBe(true);
  });
  test('acepta número positivo decimal', () => {
    expect(validatePositive(0.5)).toBe(true);
  });
  test('acepta string numérico positivo', () => {
    expect(validatePositive('12.5')).toBe(true);
  });
  test('rechaza cero', () => {
    expect(validatePositive(0)).toBe(false);
  });
  test('rechaza número negativo', () => {
    expect(validatePositive(-1)).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(validatePositive('')).toBe(false);
  });
  test('rechaza null', () => {
    expect(validatePositive(null)).toBe(false);
  });
});

// ── validateNonNegative ───────────────────────────────────────────────────────

describe('validateNonNegative', () => {
  test('acepta cero', () => {
    expect(validateNonNegative(0)).toBe(true);
  });
  test('acepta número positivo', () => {
    expect(validateNonNegative(10)).toBe(true);
  });
  test('rechaza número negativo', () => {
    expect(validateNonNegative(-0.1)).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(validateNonNegative('')).toBe(false);
  });
});

// ── validateRequired ──────────────────────────────────────────────────────────

describe('validateRequired', () => {
  test('acepta string con contenido', () => {
    expect(validateRequired('ALISAR')).toBe(true);
  });
  test('acepta número distinto de cero', () => {
    expect(validateRequired(42)).toBe(true);
  });
  test('rechaza string vacío', () => {
    expect(validateRequired('')).toBe(false);
  });
  test('rechaza string solo con espacios', () => {
    expect(validateRequired('   ')).toBe(false);
  });
  test('rechaza null', () => {
    expect(validateRequired(null)).toBe(false);
  });
  test('rechaza undefined', () => {
    expect(validateRequired(undefined)).toBe(false);
  });
});

// ── validatePercentage ────────────────────────────────────────────────────────

describe('validatePercentage', () => {
  test('acepta 0%', () => {
    expect(validatePercentage(0)).toBe(true);
  });
  test('acepta 100%', () => {
    expect(validatePercentage(100)).toBe(true);
  });
  test('acepta 50.5%', () => {
    expect(validatePercentage(50.5)).toBe(true);
  });
  test('rechaza -1%', () => {
    expect(validatePercentage(-1)).toBe(false);
  });
  test('rechaza 101%', () => {
    expect(validatePercentage(101)).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(validatePercentage('')).toBe(false);
  });
});

// ── validatePassword ──────────────────────────────────────────────────────────

describe('validatePassword', () => {
  test('acepta contraseña válida (8 chars, mayúscula, minúscula, número)', () => {
    expect(validatePassword('Alisar123')).toBe(true);
  });
  test('acepta contraseña compleja', () => {
    expect(validatePassword('Riberalta2026!')).toBe(true);
  });
  test('rechaza contraseña corta (< 8 chars)', () => {
    expect(validatePassword('Ali1')).toBe(false);
  });
  test('rechaza contraseña sin mayúscula', () => {
    expect(validatePassword('alisar123')).toBe(false);
  });
  test('rechaza contraseña sin minúscula', () => {
    expect(validatePassword('ALISAR123')).toBe(false);
  });
  test('rechaza contraseña sin número', () => {
    expect(validatePassword('AlisarABC')).toBe(false);
  });
  test('rechaza string vacío', () => {
    expect(validatePassword('')).toBe(false);
  });
  test('rechaza null', () => {
    expect(validatePassword(null)).toBe(false);
  });
  test('la contraseña por defecto "riberalta" NO cumple los requisitos', () => {
    expect(validatePassword('riberalta')).toBe(false);
  });
});

// ── getValidationMessage ──────────────────────────────────────────────────────

describe('getValidationMessage', () => {
  test('retorna mensaje para tipo required', () => {
    expect(getValidationMessage('Nombre', 'required')).toBe('Nombre es requerido');
  });
  test('retorna mensaje para tipo email', () => {
    expect(getValidationMessage('Email', 'email')).toBe('Email debe ser un email válido');
  });
  test('retorna mensaje para tipo cedula', () => {
    expect(getValidationMessage('Cédula', 'cedula')).toBe('Cédula debe ser una cédula válida (10 dígitos)');
  });
  test('retorna mensaje genérico para tipo desconocido', () => {
    expect(getValidationMessage('Campo', 'unknown')).toBe('Campo no es válido');
  });
});
