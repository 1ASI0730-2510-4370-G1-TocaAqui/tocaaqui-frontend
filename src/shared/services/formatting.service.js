/**
 * Formatting Application Service
 * 
 * En DDD, este es un Application Service que encapsula lógica de formateo
 * reutilizable entre diferentes Bounded Contexts.
 * 
 * Ubicación: Shared/Services (Application Layer)
 * Justificación: Es lógica de aplicación que no pertenece al dominio,
 * pero es compartida entre múltiples bounded contexts (Events, Payments, etc.)
 */

export class FormattingService {
  /**
   * Formatea una fecha a formato legible en español
   * @param {string|Date} date - La fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    if (!date) return '';
    
    // Asegurar que la fecha se procese en la zona horaria local
    const localDate = typeof date === 'string' 
      ? new Date(date + (date.includes('T') ? '' : 'T00:00:00'))
      : new Date(date);
      
    return localDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea un valor monetario en soles peruanos
   * @param {number} value - El valor a formatear
   * @returns {string} Valor formateado como moneda
   */
  formatCurrency(value) {
    if (value === null || value === undefined) return '';
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  }

  /**
   * Formatea un valor monetario en euros (para casos específicos)
   * @param {number} value - El valor a formatear
   * @returns {string} Valor formateado como moneda en euros
   */
  formatCurrencyEUR(value) {
    if (value === null || value === undefined) return '';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  /**
   * Formatea tiempo en formato HH:MM
   * @param {string} timeString - String de tiempo
   * @returns {string} Tiempo formateado
   */
  formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  }
}

// Singleton instance para reutilización
export const formattingService = new FormattingService(); 