export type DomainErrorCode =
  | 'MONTO_INVALIDO'
  | 'PAGO_INSUFICIENTE'
  | 'FIADO_SIN_CLIENTE'
  | 'YA_ANULADA';

/** Mensajes en lenguaje sencillo; la UI los muestra como texto, no solo color. */
export const ERROR_MESSAGES: Record<DomainErrorCode, string> = {
  MONTO_INVALIDO: 'Escribe un monto mayor que S/ 0.00.',
  PAGO_INSUFICIENTE: 'El cliente pagó menos que el total. Elige un monto mayor.',
  FIADO_SIN_CLIENTE: 'Elige a quién se le fía antes de guardar.',
  YA_ANULADA: 'Esta venta ya estaba anulada.',
};

export class DomainError extends Error {
  code: DomainErrorCode;
  constructor(code: DomainErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = 'DomainError';
    this.code = code;
  }
}
