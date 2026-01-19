
import { InventoryItem, Catalog } from './types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1, codigo: "PT001", equipo: "Asus X541Uj-GQ130T", empresa: "Zubi Group Impact", descripcion: "", tipo: "PT_Portatil", propiedad: "Zubi Group Impact", cif: "B98628100", asignado: "Sin asignar", correo: "", adm: "", fecha: "", ubicacion: "La Pinada Lab", estado: "Extraviado", material: "Obsoleto", before: "", byod: "", modelo: "X541UJ", serialNumber: "H1N0CV03M517012", caracteristicas: "", tienda: "", fechaCompra: "", factura: "", coste: "500 €", creadoPor: "Trello", responsable: "vicsaez", dispositivo: "Portatil Basico", tarjetaSim: "", conFecha: "", compania: "", pin: "", numeroTelefono: "", puk: "", tarifa: "", imei1: "", imei2: "", correoSso: "", etiq: ""
  },
  {
    id: 10, codigo: "PT007", equipo: "Lenovo Legion Y520", empresa: "Fundacion Felisa", descripcion: "Portatil Standard (pesado)", tipo: "PT_Portatil", propiedad: "Zubi Group Impact", cif: "B98628100", asignado: "Vivienda F_Felisa", correo: "vivienda@fundacionfelisa.org", adm: "OK", fecha: "2025-11-17", ubicacion: "Matteco", estado: "Prestado", material: "Entregado", before: "Carla Soler", byod: "", modelo: "80WK", serialNumber: "PF0U6H1C", caracteristicas: "Intel Core I7-7700HQ/16GB RAM/500GB", tienda: "", fechaCompra: "", factura: "", coste: "500 €", creadoPor: "vicsaez", responsable: "vicsaez", dispositivo: "Portatil Basico", tarjetaSim: "", conFecha: "", compania: "", pin: "", numeroTelefono: "", puk: "", tarifa: "", imei1: "", imei2: "", correoSso: "", etiq: "SI"
  },
  {
    id: 132, codigo: "PT043", equipo: "MSI GS63 8RE", empresa: "Zubi Group Impact", descripcion: "", tipo: "PT_Portatil", propiedad: "Zubi Group Impact", cif: "B98628100", asignado: "Vicente Saez", correo: "vicente@zubi.group", adm: "", fecha: "2022-03-01", ubicacion: "Valencia", estado: "Prestado", material: "Entregado", before: "", byod: "", modelo: "GS63 Stealth 8RE", serialNumber: "9S716K512063ZIB000114", caracteristicas: "", tienda: "PCComponentes", fechaCompra: "", factura: "", coste: "700 €", creadoPor: "vicsaez", responsable: "vicsaez", dispositivo: "Portatil Medio", tarjetaSim: "", conFecha: "", compania: "", pin: "", numeroTelefono: "", puk: "", tarifa: "", imei1: "", imei2: "", correoSso: "", etiq: ""
  },
  {
    id: 39, codigo: "SC001", equipo: "SIM Orange", empresa: "Parque Felisa", descripcion: "Migracion a Nunsys (Restauracion)", tipo: "SC_SimCard", propiedad: "Parque Felisa", cif: "B70771092", asignado: "Cafeteria LPF", correo: "", adm: "", fecha: "2023-01-02", ubicacion: "La Pinada Fun", estado: "Alta", material: "Entregado", before: "Belen Balada", byod: "", modelo: "", serialNumber: "", caracteristicas: "", tienda: "", fechaCompra: "", factura: "", coste: "10 €", creadoPor: "AitorCarricondo", responsable: "vicsaez", dispositivo: "Linea ILIMITADA", tarjetaSim: "Nunsys", conFecha: "7529", compania: "665883300", pin: "74559859", numeroTelefono: "", puk: "", tarifa: "", imei1: "", imei2: "", correoSso: "", etiq: ""
  },
  {
    id: 281, codigo: "PT080", equipo: "Macbook Pro 2021 (M1 Pro)", empresa: "Zubi Group Impact", descripcion: "", tipo: "PT_Portatil", propiedad: "Zubi Group Impact", cif: "B98628100", asignado: "Sin asignar", correo: "", adm: "", fecha: "", ubicacion: "Valencia", estado: "Indefinido", material: "Pendiente", before: "Iker Marcaide", byod: "", modelo: "", serialNumber: "D3KYHG9YQ5", caracteristicas: "", tienda: "MediaMarkt", fechaCompra: "", factura: "", coste: "900 €", creadoPor: "vicsaez", responsable: "vicsaez", dispositivo: "Portatil Premium", tarjetaSim: "", conFecha: "", compania: "", pin: "", numeroTelefono: "", puk: "", tarifa: "", imei1: "", imei2: "", correoSso: "", etiq: ""
  }
];

export const CATALOG: Catalog = {
  tiendas: ["1&1", "Adobe", "Amazon", "Arquímedes", "Autodesk", "BackMarket", "Carrefour", "Construbit", "CYPE", "Digital River", "EcoPC", "ElCorteIngles", "Fairphone", "Fleet", "MediaMarkt", "Nuki Home", "PCComponentes"],
  empresas: ["Zubi Group Impact", "Sustainable Towns (ZCi)", "Fundacion Felisa", "Zubi Labs Impact", "Zubi Education", "Zubi Cities", "Griffo Solutions", "Matteco (Matteco Team)", "Woodea", "CoCircular", "Parque Felisa", "Zubi Capital", "Gonido (Build Tech Energy)", "Kampe (Learning on the Job)", "Hands-on Impact", "Teradx Diagnostics", "Devera (Eco Impact Tech)", "Greenest AI"],
  tipos: ["PT_Portatil", "MV_Móvil", "SW_Software", "SC_SimCard", "CB_ChromeBook", "TB_Tablet", "PC_MiniPC", "MS_Mouse", "MN_Monitor", "KB_Keyboard", "OG_OcolusGo", "HS_Auriculares", "CV_Capturadora", "AD_Adaptador", "WC_Webcam", "PR_Impresora", "RT_Router", "AP_AccesPoint", "CM_Camara-Vig", "DK_Dock", "MF_Microfono", "AV_Altavoces", "TV_Television"],
  dispositivos: ["Portatil Basico", "Portatil Medio", "Portatil Premium", "Portatil Premium+", "Movil Basico", "Movil Premium", "Tablet", "Monitor", "MiniPC", "Software", "Linea ILIMITADA", "Linea INFINITA", "Impresora", "Acces_Point", "WebCam"],
  ubicaciones: ["La Pinada Lab", "Terminal Hub", "Valencia", "Madrid", "Paterna", "Castellon", "Mislata", "Alicante", "Murcia", "Barcelona", "Pontevedra", "Arenys de Mar", "Gandia", "Sevilla", "Cádiz", "Granada", "Santa Coloma", "Moncofa", "El Puig"],
  propiedades: ["Zubi Group Impact", "Zubi Cities", "Zubi Education", "Fundacion Felisa", "Personal", "Sustainable Towns", "Zubi Capital", "CoCircular", "Devera", "Gonido", "Woodea", "Parque Felisa"],
  estados: ["Alta", "Baja", "Prestado", "Reserva", "Extraviado", "Propiedad", "Licencia", "Indefinido", "Bloqueo", "Devolucion", "Leasing"],
  materiales: ["Entregado", "Obsoleto", "Vigente", "Pendiente", "Devuelto", "Propio", "Retornado"],
  companias: ["Orange", "Nunsys", "O2online", "Pepephone", "Movistar"],
  creadores: ["vicsaez", "AitorCarricondo", "jesusrivera", "eduardo_moreno", "vicente_saez", "Trello"]
};
