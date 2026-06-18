/**
 * Configuración de Tema - ALISAR
 * Define los colores, tipografías y estilos globales de la empresa
 * Colores corporativos: Amarillo (#FFD700) y Negro (#000000)
 */

export const theme = {
  // ═══════════════════════════════════════════════════════════
  // COLORES CORPORATIVOS
  // ═══════════════════════════════════════════════════════════
  colors: {
    // Colores Primarios
    primary: '#FFD700',        // Amarillo corporativo
    primaryDark: '#DAA500',    // Amarillo oscuro
    primaryLight: '#FFED4E',   // Amarillo claro
    primaryGlow: 'rgba(255, 215, 0, 0.18)',

    // Colores Secundarios
    secondary: '#000000',      // Negro corporativo
    secondaryLight: '#1f2937', // Negro suave
    secondaryDark: '#111827',  // Negro oscuro

    // Colores de Fondo
    bg: '#111827',             // Fondo muy oscuro
    bgElev: '#131313',         // Fondo elevado
    bgCard: '#1f2937',         // Fondo de cards
    bgCardLight: '#1f2937',    // Fondo de cards más claro

    // Bordes y Separadores
    border: '#374151',         // Borde principal
    borderSoft: '#222222',     // Borde suave
    borderLight: '#404040',    // Borde claro

    // Texto
    text: '#ffffff',           // Texto principal blanco
    textDim: '#cccccc',        // Texto atenuado
    textMute: '#999999',       // Texto muted
    textAlt: '#000000',        // Texto alternativo (sobre amarillo)

    // Estados
    success: '#4ade80',        // Verde (mantener)
    warning: '#fbbf24',        // Amarillo adicional para warnings
    danger: '#f87171',         // Rojo (mantener)
    info: '#60a5fa',           // Azul (mantener)
    disabled: '#6b7280',       // Deshabilitado

    // Gradientes
    gradientPrimary: 'linear-gradient(135deg, #FFD700, #DAA500)',
    gradientSecondary: 'linear-gradient(135deg, #1f2937, #111827)',
  },

  // ═══════════════════════════════════════════════════════════
  // TIPOGRAFÍAS
  // ═══════════════════════════════════════════════════════════
  fonts: {
    display: "'Bricolage Grotesque', system-ui, sans-serif",
    body: "'Manrope', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },

  // ═══════════════════════════════════════════════════════════
  // ESPACIADO
  // ═══════════════════════════════════════════════════════════
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  // ═══════════════════════════════════════════════════════════
  // BORDES REDONDEADOS
  // ═══════════════════════════════════════════════════════════
  radius: {
    sm: '8px',
    md: '10px',
    lg: '14px',
    full: '999px',
  },

  // ═══════════════════════════════════════════════════════════
  // SOMBRAS
  // ═══════════════════════════════════════════════════════════
  shadows: {
    sm: '0 2px 4px rgba(255, 215, 0, 0.1)',
    md: '0 4px 12px rgba(255, 215, 0, 0.15)',
    lg: '0 8px 24px rgba(255, 215, 0, 0.2)',
    hard: '0 10px 40px rgba(0, 0, 0, 0.45)',
  },

  // ═══════════════════════════════════════════════════════════
  // COMPONENTES PREDEFINIDOS
  // ═══════════════════════════════════════════════════════════
  components: {
    // Estilo para botón primario
    buttonPrimary: {
      background: '#FFD700',
      color: '#000000',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: '0 4px 16px rgba(255, 215, 0, 0.25)',
      transition: 'all 0.15s ease',
    },

    // Estilo para botón secundario
    buttonSecondary: {
      background: 'transparent',
      color: '#FFD700',
      border: '1px solid #FFD700',
      padding: '12px 24px',
      borderRadius: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.15s ease',
    },

    // Estilo para input/textarea
    input: {
      background: '#1f2937',
      border: '1px solid #374151',
      color: '#ffffff',
      padding: '10px 12px',
      borderRadius: '10px',
      fontSize: '14px',
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color 0.15s ease',
    },

    // Estilo para card
    card: {
      background: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '14px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    },

    // Estilo para sección expandible
    section: {
      background: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '14px',
      overflow: 'hidden',
    },

    sectionHeader: {
      padding: '14px 16px',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(255, 215, 0, 0.04))',
      borderBottom: '1px solid #374151',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s ease',
    },

    sectionTitle: {
      margin: 0,
      fontSize: '14px',
      fontWeight: '600',
      color: '#FFD700',
    },
  },
};

/**
 * Hook personalizado para usar el tema en componentes
 * @returns {Object} Objeto theme con todos los estilos
 */
export const useTheme = () => {
  return theme;
};

export default theme;
