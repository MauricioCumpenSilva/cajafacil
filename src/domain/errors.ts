export type DomainErrorCode =
  | 'MONTO_INVALIDO'
  | 'PAGO_INSUFICIENTE'
  | 'FIADO_SIN_CLIENTE'
  | 'YA_ANULADA'
  | 'NO_ES_FIADO'
  | 'YA_COBRADO'
  | 'COBRO_INVALIDO';

/** Mensajes en lenguaje sencillo; la UI los muestra como texto, no solo color. */
export const ERROR_MESSAGES: Record<DomainErrorCode, string> = {
  MONTO_INVALIDO: 'Escribe un monto mayor que S/ 0.00.',
  PAGO_INSUFICIENTE: 'El cliente pagó menos que el total. Elige un monto mayor.',
  FIADO_SIN_CLIENTE: 'Elige a quién se le fía antes de guardar.',
  YA_ANULADA: 'Esta venta ya estaba anulada.',
  NO_ES_FIADO: 'Esta venta no es un fiado.',
  YA_COBRADO: 'Este fiado ya fue cobrado.',
  COBRO_INVALIDO: 'Elige cómo te pagó: efectivo o Yape / Plin.',
};

export class DomainError extends Error {
  code: DomainErrorCode;
  constructor(code: DomainErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = 'DomainError';
    this.code = code;
  }
}
