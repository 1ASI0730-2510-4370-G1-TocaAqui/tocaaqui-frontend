/**
 * Status Domain Service
 * 
 * En DDD, este es un Domain Service que encapsula lógica de dominio
 * relacionada con estados que es compartida entre múltiples Bounded Contexts.
 * 
 * Ubicación: Shared/Model (Domain Layer)
 * Justificación: La lógica de mapeo de estados a severidades es conocimiento
 * del dominio que trasciende los bounded contexts individuales.
 */

export class StatusDomainService {
  /**
   * Obtiene la severidad de color para un estado general
   * @param {string} status - El estado a evaluar
   * @returns {string} Severidad para PrimeVue (success, warning, danger, info)
   */
  getStatusSeverity(status) {
    if (!status) return 'info';
    
    const statusLower = status.toLowerCase();
    const severities = {
      // Estados generales del dominio
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      cancelled: 'danger',
      completed: 'success',
      active: 'success',
      
      // Estados de contratos (Events domain)
      contract_pending: 'info',
      signed: 'success',
      
      // Estados confirmados
      confirmed: 'success'
    };
    
    return severities[statusLower] || 'info';
  }

  /**
   * Obtiene severidad específica para estados de pago (Payments domain)
   * @param {string} status - Estado del pago
   * @returns {string} Severidad para PrimeVue
   */
  getPaymentStatusSeverity(status) {
    if (!status) return 'info';
    
    const statusUpper = status.toUpperCase();
    const severities = {
      'PENDING': 'warning',
      'HELD': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'danger'
    };
    
    return severities[statusUpper] || 'info';
  }

  /**
   * Verifica si un estado indica una operación completada exitosamente
   * @param {string} status - El estado a verificar
   * @returns {boolean} True si el estado indica éxito
   */
  isSuccessStatus(status) {
    if (!status) return false;
    
    const successStatuses = [
      'accepted', 'completed', 'active', 'signed', 'confirmed'
    ];
    
    return successStatuses.includes(status.toLowerCase());
  }

  /**
   * Verifica si un estado indica una operación pendiente
   * @param {string} status - El estado a verificar
   * @returns {boolean} True si el estado indica pendiente
   */
  isPendingStatus(status) {
    if (!status) return false;
    
    const pendingStatuses = [
      'pending', 'contract_pending', 'held'
    ];
    
    return pendingStatuses.includes(status.toLowerCase());
  }

  /**
   * Verifica si un estado indica una operación fallida
   * @param {string} status - El estado a verificar
   * @returns {boolean} True si el estado indica falla
   */
  isFailureStatus(status) {
    if (!status) return false;
    
    const failureStatuses = [
      'rejected', 'cancelled'
    ];
    
    return failureStatuses.includes(status.toLowerCase());
  }
}

// Singleton instance para reutilización
export const statusDomainService = new StatusDomainService();