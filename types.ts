
export interface InventoryItem {
  id: number;
  codigo: string;
  equipo: string;
  empresa: string;
  descripcion: string;
  tipo: string;
  propiedad: string;
  cif: string;
  asignado: string;
  correo: string;
  adm: string;
  fecha: string;
  ubicacion: string;
  estado: string;
  material: string;
  before: string;
  byod: string;
  modelo: string;
  serialNumber: string;
  caracteristicas: string;
  tienda: string;
  fechaCompra: string;
  factura: string;
  coste: string;
  creadoPor: string;
  responsable: string;
  dispositivo: string;
  tarjetaSim: string;
  conFecha: string;
  compania: string;
  pin: string;
  numeroTelefono: string;
  puk: string;
  tarifa: string;
  imei1: string;
  imei2: string;
  correoSso: string;
  etiq: string;
}

export interface Catalog {
  tiendas: string[];
  empresas: string[];
  cifs: string[];
  tipos: string[];
  dispositivos: string[];
  ubicaciones: string[];
  propiedades: string[];
  estados: string[];
  materiales: string[];
  companias: string[];
  creadores: string[];
}

export type ViewType = 'dashboard' | 'inventory' | 'reports' | 'settings' | 'add';
