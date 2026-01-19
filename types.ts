
export interface InventoryItem {
  ID: number;
  CODIGO: string;
  EQUIPO: string;
  EMPRESA: string;
  DESCRIPCION: string;
  TIPO: string;
  PROPIEDAD: string;
  CIF: string;
  ASIGNADO: string;
  CORREO: string;
  ADM: string;
  FECHA: string;
  UBICACION: string;
  ESTADO: string;
  MATERIAL: string;
  BEFORE: string;
  BYOD: string;
  MODELO: string;
  SERIAL_NUMBER: string;
  CARACTERISTICAS: string;
  TIENDA: string;
  FECHA_COMPRA: string;
  FACTURA: string;
  COSTE: string;
  CREADO_POR: string;
  RESPONSABLE: string;
  DISPOSITIVO: string;
  TARJETA_SIM: string;
  CON_FECHA: string;
  COMPAÑIA: string;
  PIN: string;
  Nº_TELEFONO: string;
  PUK: string;
  TARIFA: string;
  IMEI_1: string;
  IMEI_2: string;
  CORREO_SSO: string;
  ETIQ: string;
}

export interface Catalog {
  tiendas: string[];
  empresas: string[];
  tipos: string[];
  dispositivos: string[];
  ubicaciones: string[];
  propiedades: string[];
  cifs: string[];
  estados: string[];
  materiales: string[];
  companias: string[];
  creadores: string[];
}

export type ViewType = 'dashboard' | 'inventory' | 'reports' | 'settings' | 'add' | 'catalog';
