
import React, { useState, useRef } from 'react';
import { InventoryItem, Catalog } from '../types';
// Always use double quotes for @google/genai import
import { GoogleGenAI } from "@google/genai";
import { 
  Save, 
  ArrowLeft, 
  Info, 
  Hash,
  Laptop,
  Building,
  MapPin,
  Clock,
  Package,
  Wifi,
  Smartphone,
  CreditCard,
  Camera,
  Loader2,
  X,
  FileText,
  User,
  DollarSign,
  CheckCircle2,
  Cpu,
  Bot
} from 'lucide-react';

interface InventoryFormProps {
  onSubmit: (item: InventoryItem) => void;
  initialData: InventoryItem | null;
  catalog: Catalog;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onSubmit, initialData, catalog, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    initialData || {
      codigo: '', equipo: '', empresa: catalog.empresas[0] || '', descripcion: '',
      tipo: catalog.tipos[0] || '', propiedad: catalog.propiedades[0] || '',
      cif: '', asignado: 'Sin asignar', correo: '', adm: '',
      fecha: new Date().toISOString().split('T')[0], ubicacion: catalog.ubicaciones[0] || '',
      estado: catalog.estados[0] || '', material: catalog.materiales[0] || '',
      before: '', byod: '', modelo: '', serialNumber: '',
      caracteristicas: '', tienda: catalog.tiendas[0] || '', fechaCompra: '',
      factura: '', coste: '0 €', creadoPor: catalog.creadores[0] || '',
      responsable: '', dispositivo: catalog.dispositivos[0] || '', tarjetaSim: '',
      conFecha: '', compania: catalog.companias[0] || '', pin: '',
      numeroTelefono: '', puk: '', tarifa: '', imei1: '', imei2: '',
      correoSso: '', etiq: ''
    }
  );

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error al acceder a la cámara.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const captureAndScan = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    setIsProcessingImage(true);
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Data = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    stopCamera();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
              { text: "Extrae de la etiqueta: equipo, modelo, serialNumber, tipo (elige el más adecuado de: " + catalog.tipos.join(', ') + "). Devuelve solo un objeto JSON plano." }
            ]
          }
        ],
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleanJson);
      
      setFormData(prev => ({
        ...prev,
        equipo: result.equipo || prev.equipo,
        modelo: result.modelo || prev.modelo,
        serialNumber: result.serialNumber || prev.serialNumber,
        tipo: catalog.tipos.includes(result.tipo) ? result.tipo : prev.tipo
      }));
    } catch (err) {
      console.error("Error AI Scan:", err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as InventoryItem);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* HEADER DINÁMICO FIJO (STICKY) */}
      <div className="sticky top-[-1.5rem] z-[40] bg-slate-50/90 backdrop-blur-md pt-6 pb-8 px-2 -mx-2 border-b border-slate-200/50 mb-10 transition-all">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all mb-3 text-xs font-black uppercase tracking-[0.2em]">
              <ArrowLeft size={14} /> Volver al listado
            </button>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-4">
              {initialData ? 'EDITAR FICHA TÉCNICA' : 'REGISTRO DE NUEVO ACTIVO'}
              {!initialData && <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Draft</span>}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={startCamera} className="bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-50 transition-all uppercase tracking-widest flex items-center gap-3 shadow-sm">
              <Camera size={18} /> Escaneo Inteligente
            </button>
            <button onClick={handleSubmit} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-black flex items-center gap-3 shadow-2xl transition-all uppercase tracking-widest text-xs active:scale-95">
              <Save size={18} /> Guardar Activo
            </button>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-black rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)] border-4 border-white/10">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-blue-400/50 rounded-2xl relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-blue-500 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                </div>
            </div>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
              <button onClick={stopCamera} className="bg-white/10 text-white p-6 rounded-3xl border border-white/10 hover:bg-rose-600 transition-all"><X size={32} /></button>
              <button onClick={captureAndScan} className="bg-blue-600 text-white p-6 rounded-3xl shadow-2xl border border-blue-400 hover:scale-110 transition-transform"><Camera size={32} /></button>
            </div>
          </div>
          <p className="mt-8 text-white font-black uppercase tracking-[0.3em] text-xs">Apunte al número de serie o etiqueta del equipo</p>
        </div>
      )}

      {isProcessingImage && (
        <div className="fixed inset-0 z-[70] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 size={80} className="text-blue-600 animate-spin mb-6" />
            <Bot size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] text-blue-600" />
          </div>
          <p className="font-black text-slate-900 uppercase tracking-[0.4em] text-sm">Extrayendo metadatos hardware...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* BLOQUE 1: IDENTIDAD Y LEGAL */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg text-white">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">1. Identidad y Marco Legal</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Definición base del activo en el ecosistema</p>
              </div>
            </div>
            <CheckCircle2 className="text-slate-200 group-focus-within:text-blue-500 transition-colors" size={24} />
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormGroup label="Código Interno" helper="Ej: PT-2024-001">
              <input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Identificador único" className="form-input" required />
            </FormGroup>
            <FormGroup label="Nombre del Equipo">
              <input name="equipo" value={formData.equipo} onChange={handleChange} placeholder="Ej: Macbook Pro M3" className="form-input" required />
            </FormGroup>
            <FormGroup label="Tipo de Activo">
              <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input">
                {catalog.tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Empresa Propietaria">
              <select name="empresa" value={formData.empresa} onChange={handleChange} className="form-input">
                {catalog.empresas.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="CIF/NIF Empresa">
              <input name="cif" value={formData.cif} onChange={handleChange} placeholder="Validación fiscal" className="form-input" />
            </FormGroup>
            <FormGroup label="Gestión de Propiedad">
              <select name="propiedad" value={formData.propiedad} onChange={handleChange} className="form-input">
                {catalog.propiedades.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormGroup>
            <div className="lg:col-span-3">
              <FormGroup label="Descripción y Notas de Registro">
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="form-input min-h-[80px]" placeholder="Detalles específicos del registro inicial..."></textarea>
              </FormGroup>
            </div>
          </div>
        </section>

        {/* BLOQUE 2: ASIGNACIÓN Y LOGÍSTICA */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-4 rounded-2xl shadow-lg text-white">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">2. Asignación y Operativa</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Control de responsables y ubicación física</p>
              </div>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormGroup label="Usuario Asignado (Owner)">
              <input name="asignado" value={formData.asignado} onChange={handleChange} className="form-input" placeholder="Nombre completo del usuario" />
            </FormGroup>
            <FormGroup label="Responsable IT">
              <select name="responsable" value={formData.responsable} onChange={handleChange} className="form-input">
                {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Correo Corporativo">
              <input name="correo" type="email" value={formData.correo} onChange={handleChange} className="form-input" placeholder="usuario@zubi.group" />
            </FormGroup>
            <FormGroup label="Estado Operativo">
              <select name="estado" value={formData.estado} onChange={handleChange} className="form-input">
                {catalog.estados.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Ubicación Física">
              <select name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="form-input">
                {catalog.ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Categoría de Material">
              <select name="material" value={formData.material} onChange={handleChange} className="form-input">
                {catalog.materiales.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Fecha de Entrega">
              <input name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="form-input" />
            </FormGroup>
            <FormGroup label="¿Es equipo BYOD?">
              <select name="byod" value={formData.byod} onChange={handleChange} className="form-input">
                <option value="">No (Propiedad Empresa)</option>
                <option value="SI">Sí (Bring Your Own Device)</option>
              </select>
            </FormGroup>
            <FormGroup label="Correo SSO (Single Sign-On)">
              <input name="correoSso" value={formData.correoSso} onChange={handleChange} className="form-input" placeholder="Email de autenticación" />
            </FormGroup>
            <FormGroup label="Estatus ADM">
              <input name="adm" value={formData.adm} onChange={handleChange} className="form-input" placeholder="Estado de administración" />
            </FormGroup>
            <FormGroup label="Usuario Anterior (Before)">
              <input name="before" value={formData.before} onChange={handleChange} className="form-input" placeholder="Historial de dueño previo" />
            </FormGroup>
            <FormGroup label="Etiquetado Físico">
              <select name="etiq" value={formData.etiq} onChange={handleChange} className="form-input">
                <option value="">PENDIENTE</option>
                <option value="SI">ETIQUETADO OK</option>
                <option value="NO">SIN ETIQUETA</option>
              </select>
            </FormGroup>
          </div>
        </section>

        {/* BLOQUE 3: HARDWARE Y FINANZAS */}
        <section className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden group hover:border-amber-200 transition-colors">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-600 p-4 rounded-2xl shadow-lg text-white">
                <Cpu size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">3. Especificaciones y Capital</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Detalles técnicos del hardware y valor de adquisición</p>
              </div>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormGroup label="Fabricante / Modelo">
              <input name="modelo" value={formData.modelo} onChange={handleChange} className="form-input" placeholder="Ej: Lenovo ThinkPad L14" />
            </FormGroup>
            <FormGroup label="Número de Serie (S/N)">
              <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="form-input" placeholder="Serial único de fábrica" />
            </FormGroup>
            <FormGroup label="Perfil de Dispositivo">
              <select name="dispositivo" value={formData.dispositivo} onChange={handleChange} className="form-input">
                {catalog.dispositivos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Proveedor / Tienda">
              <select name="tienda" value={formData.tienda} onChange={handleChange} className="form-input">
                {catalog.tiendas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Costo de Adquisición">
              <input name="coste" value={formData.coste} onChange={handleChange} className="form-input" placeholder="0.00 €" />
            </FormGroup>
            <FormGroup label="Fecha de Compra">
              <input name="fechaCompra" type="date" value={formData.fechaCompra} onChange={handleChange} className="form-input" />
            </FormGroup>
            <FormGroup label="Referencia de Factura">
              <input name="factura" value={formData.factura} onChange={handleChange} className="form-input" placeholder="Nº de comprobante" />
            </FormGroup>
            <FormGroup label="Creado por (Audit)">
              <select name="creadoPor" value={formData.creadoPor} onChange={handleChange} className="form-input">
                {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <div className="lg:col-span-3">
              <FormGroup label="Especificaciones Hardware Detalladas">
                <textarea name="caracteristicas" value={formData.caracteristicas} onChange={handleChange} rows={3} className="form-input min-h-[100px]" placeholder="Procesador, RAM, Almacenamiento, Tarjeta Gráfica..."></textarea>
              </FormGroup>
            </div>
          </div>
        </section>

        {/* BLOQUE 4: CONECTIVIDAD Y SEGURIDAD */}
        <section className="bg-slate-900 rounded-[3rem] shadow-xl border border-slate-800 overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-4 rounded-2xl shadow-lg text-white">
                <Wifi size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">4. Comunicaciones y Red</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestión de líneas, SIMs e identificadores de red</p>
              </div>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FormGroup label="Número de Teléfono" dark>
              <input name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} className="form-input-dark" placeholder="+34 6XX..." />
            </FormGroup>
            <FormGroup label="Operador / Compañía" dark>
              <select name="compania" value={formData.compania} onChange={handleChange} className="form-input-dark">
                {catalog.companias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="ICCID de Tarjeta SIM" dark>
              <input name="tarjetaSim" value={formData.tarjetaSim} onChange={handleChange} className="form-input-dark" placeholder="8934..." />
            </FormGroup>
            <FormGroup label="Nombre de Tarifa" dark>
              <input name="tarifa" value={formData.tarifa} onChange={handleChange} className="form-input-dark" placeholder="Plan contratado" />
            </FormGroup>
            <FormGroup label="IMEI Principal" dark>
              <input name="imei1" value={formData.imei1} onChange={handleChange} className="form-input-dark" placeholder="IMEI 1" />
            </FormGroup>
            <FormGroup label="IMEI Secundario" dark>
              <input name="imei2" value={formData.imei2} onChange={handleChange} className="form-input-dark" placeholder="IMEI 2" />
            </FormGroup>
            <FormGroup label="PIN Seguridad" dark>
              <input name="pin" value={formData.pin} onChange={handleChange} className="form-input-dark" placeholder="4 dígitos" />
            </FormGroup>
            <FormGroup label="Código PUK" dark>
              <input name="puk" value={formData.puk} onChange={handleChange} className="form-input-dark" placeholder="8 dígitos" />
            </FormGroup>
          </div>
        </section>

        {/* ACCIONES FINALES */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-white rounded-[3rem] border border-slate-200 shadow-xl">
            <div className="flex items-center gap-4 text-slate-400">
                <Info size={20} className="text-blue-500" />
                <p className="text-xs font-bold leading-relaxed">
                    Al guardar, el activo se integrará inmediatamente en los <br/>
                    reportes de valorización y el listado global de activos.
                </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button type="button" onClick={onCancel} className="flex-1 md:flex-none px-10 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-xs">
                    Descartar
                </button>
                <button type="submit" className="flex-1 md:flex-none bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-700 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs active:scale-95">
                    <Save size={20} /> Finalizar Registro
                </button>
            </div>
        </div>
      </form>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        .form-input { @apply w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300; }
        .form-input-dark { @apply w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:bg-white/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600; }
        @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; children: React.ReactNode; helper?: string; dark?: boolean }> = ({ label, children, helper, dark }) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between px-1">
        <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
        {helper && <span className="text-[9px] font-bold text-slate-300 italic">{helper}</span>}
    </div>
    {children}
  </div>
);

export default InventoryForm;
