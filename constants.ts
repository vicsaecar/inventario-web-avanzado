
import { InventoryItem, Catalog } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    ID: 1, CODIGO: "PT001", EQUIPO: "Asus X541Uj-GQ130T", EMPRESA: "Zubi Group Impact", DESCRIPCION: "Portátil antiguo recuperado", TIPO: "PT_Portatil", PROPIEDAD: "Zubi Group Impact", CIF: "B98628100", ASIGNADO: "Sin asignar", CORREO: "", ADM: "", FECHA: "", UBICACION: "La Pinada Lab", ESTADO: "Extraviado", MATERIAL: "Obsoleto", BEFORE: "", BYOD: "NO", MODELO: "X541UJ", SERIAL_NUMBER: "H1N0CV03M517012", CARACTERISTICAS: "", TIENDA: "", FECHA_COMPRA: "", FACTURA: "", COSTE: "500 €", CREADO_POR: "Trello", RESPONSABLE: "vicsaez", DISPOSITIVO: "Portatil Basico", TARJETA_SIM: "", CON_FECHA: "", COMPAÑIA: "", PIN: "", Nº_TELEFONO: "", PUK: "", TARIFA: "", IMEI_1: "", IMEI_2: "", CORREO_SSO: "", ETIQ: ""
  }
];

export const CATALOG: Catalog = {
  tiendas: ["1&1", "Adobe", "Amazon", "Arquímedes", "Autodesk", "BackMarket", "Carrefour", "Construbit", "CYPE", "Digital River", "EcoPC", "ElCorteIngles", "Fairphone", "Fleet", "MediaMarkt", "Nuki Home", "PCComponentes"],
  empresas: ["Zubi Group Impact", "Sustainable Towns (ZCi)", "Fundacion Felisa", "Zubi Labs Impact", "Zubi Education", "Zubi Cities", "Griffo Solutions", "Matteco (Matteco Team)", "Woodea", "CoCircular", "Parque Felisa", "Zubi Capital", "Gonido (Build Tech Energy)", "Kampe (Learning on the Job)", "Hands-on Impact", "Teradx Diagnostics", "Devera (Eco Impact Tech)", "Greenest AI"],
  cifs: ["B98628100", "B70771092", "B12345678", "A87654321", "B00000000"],
  tipos: ["PT_Portatil", "MV_Móvil", "SW_Software", "SC_SimCard", "CB_ChromeBook", "TB_Tablet", "PC_MiniPC", "MS_Mouse", "MN_Monitor", "KB_Keyboard", "OG_OcolusGo", "HS_Auriculares", "CV_Capturadora", "AD_Adaptador", "WC_Webcam", "PR_Impresora", "RT_Router", "AP_AccesPoint", "CM_Camara-Vig", "DK_Dock", "MF_Microfono", "AV_Altavoces", "TV_Television"],
  dispositivos: ["Portatil Basico", "Portatil Medio", "Portatil Premium", "Portatil Premium+", "Movil Basico", "Movil Premium", "Tablet", "Monitor", "MiniPC", "Software", "Linea ILIMITADA", "Linea INFINITA", "Impresora", "Acces_Point", "WebCam"],
  ubicaciones: ["La Pinada Lab", "Terminal Hub", "Valencia", "Madrid", "Paterna", "Castellon", "Mislata", "Alicante", "Murcia", "Barcelona", "Pontevedra", "Arenys de Mar", "Gandia", "Sevilla", "Cádiz", "Granada", "Santa Coloma", "Moncofa", "El Puig"],
  propiedades: ["Zubi Group Impact", "Zubi Cities", "Zubi Education", "Fundacion Felisa", "Personal", "Sustainable Towns", "Zubi Capital", "CoCircular", "Devera", "Gonido", "Woodea", "Parque Felisa"],
  estados: ["Alta", "Baja", "Prestado", "Reserva", "Extraviado", "Propiedad", "Licencia", "Indefinido", "Bloqueo", "Devolucion", "Leasing"],
  materiales: ["Entregado", "Obsoleto", "Vigente", "Pendiente", "Devuelto", "Propio", "Retornado"],
  companias: ["Orange", "Nunsys", "O2online", "Pepephone", "Movistar"],
  creadores: ["vicsaez", "AitorCarricondo", "jesusrivera", "eduardo_moreno", "vicente_saez", "Trello"]
};
