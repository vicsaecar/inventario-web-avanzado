
import React, { useState, useRef } from 'react';
import { InventoryItem, Catalog } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
  Save, 
  ArrowLeft, 
  Info, 
  Camera, 
  Loader2, 
  X, 
  FileText, 
  User, 
  Cpu, 
  Bot,
  Wifi,
  CreditCard,
  Briefcase,
  History,
  ShieldCheck,
  Smartphone,
  Tag
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
      cif: catalog.cifs[0] || '', asignado: 'Sin asignar', correo: '', adm: '',
      fecha: new Date().toISOString().split('T')[0], ubicacion: catalog.ubicaciones[0] || '',
      estado: catalog.estados[0] || '', material: catalog.materiales[0] || '',
      before: '', byod: 'NO', modelo: '', serialNumber: '',
      caracteristicas: '', tienda: catalog.tiendas[0] || '', fechaCompra: '',
      factura: '', coste: '0 €', creadoPor: catalog.creadores[0] || '',
      responsable: catalog.creadores[0] || '', dispositivo: catalog.dispositivos[0] || '', tarjetaSim: '',
      conFecha: '', compania: catalog.companias[0] || '', pin: '',
      numeroTelefono: '', puk: '', tarifa: '', imei1: '', imei2: '',
      correoSso: '', etiq: 'PENDIENTE'
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
      {/* HEADER DINÁMICO FIJO (STICKY) - FONDO CLARO */}
      <div className="sticky top-[-1.5rem] z-[40] bg-slate-50/95 backdrop-blur-md pt-6 pb-6 px-4 -mx-4 border-b border-slate-200 mb-8 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all mb-1 text-xs font-black uppercase tracking-widest">
              <ArrowLeft size={14} /> Volver al listado
            </button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
              {initialData ? 'EDITAR FICHA TÉCNICA' : 'REGISTRO DE NUEVO ACTIVO'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={startCamera} className="bg-white border-2 border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <Camera size={16} /> Scan IA
            </button>
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs active:scale-95">
              <Save size={18} /> Guardar Activo
            </button>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[60] bg-slate-900/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-black rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-40 border-2 border-blue-400/50 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 animate-[scan_2s_linear_infinite]"></div>
                </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button onClick={stopCamera} className="bg-white/20 text-white p-4 rounded-full hover:bg-rose-600 transition-all"><X size={24} /></button>
              <button onClick={captureAndScan} className="bg-blue-600 text-white p-4 rounded-full hover:scale-110 transition-transform"><Camera size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {isProcessingImage && (
        <div className="fixed inset-0 z-[70] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <Loader2 size={64} className="text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Extrayendo Datos...</h3>
          <p className="text-slate-500 text-sm mt-2">La IA está procesando la etiqueta del hardware.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* BLOQUE 1: IDENTIDAD Y LEGAL (6 CAMPOS) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><FileText size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">1. Identidad y Marco Legal</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Origen y categorización legal del activo</p>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormGroup label="Código Interno (PT/MV...)"><input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: PT007" className="form-input" required /></FormGroup>
            <FormGroup label="Nombre del Equipo"><input name="equipo" value={formData.equipo} onChange={handleChange} placeholder="Ej: Lenovo ThinkPad L14" className="form-input" required /></FormGroup>
            <FormGroup label="Empresa Propietaria">
              <select name="empresa" value={formData.empresa} onChange={handleChange} className="form-input">
                {catalog.empresas.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="CIF/NIF Entidad">
              <select name="cif" value={formData.cif} onChange={handleChange} className="form-input">
                {catalog.cifs.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Tipo de Activo">
              <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input">
                {catalog.tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Gestión de Propiedad">
              <select name="propiedad" value={formData.propiedad} onChange={handleChange} className="form-input">
                {catalog.propiedades.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormGroup>
          </div>
        </section>

        {/* BLOQUE 2: ASIGNACIÓN Y OPERATIVA (11 CAMPOS) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><User size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">2. Asignación y Operativa</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Trazabilidad de usuarios y estado físico</p>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FormGroup label="Usuario Asignado"><input name="asignado" value={formData.asignado} onChange={handleChange} placeholder="Nombre completo" className="form-input" /></FormGroup>
            <FormGroup label="Responsable IT">
              <select name="responsable" value={formData.responsable} onChange={handleChange} className="form-input">
                {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Correo Corporativo"><input name="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="usuario@zubi.group" className="form-input" /></FormGroup>
            <FormGroup label="Correo SSO"><input name="correoSso" value={formData.correoSso} onChange={handleChange} placeholder="Email SSO" className="form-input" /></FormGroup>
            <FormGroup label="Estatus ADM"><input name="adm" value={formData.adm} onChange={handleChange} placeholder="Ej: OK / PEND" className="form-input" /></FormGroup>
            <FormGroup label="Fecha de Registro"><input name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="Ubicación Física">
              <select name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="form-input">
                {catalog.ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Estado del Activo">
              <select name="estado" value={formData.estado} onChange={handleChange} className="form-input">
                {catalog.estados.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Categoría Material">
              <select name="material" value={formData.material} onChange={handleChange} className="form-input">
                {catalog.materiales.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Usuario Anterior"><input name="before" value={formData.before} onChange={handleChange} placeholder="Propiedad previa" className="form-input" /></FormGroup>
            <FormGroup label="¿Es equipo BYOD?">
              <select name="byod" value={formData.byod} onChange={handleChange} className="form-input">
                <option value="NO">NO (Propiedad Empresa)</option>
                <option value="SI">SÍ (Traído por el usuario)</option>
              </select>
            </FormGroup>
          </div>
        </section>

        {/* BLOQUE 3: HARDWARE Y ESPECIFICACIONES (5 CAMPOS) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600"><Cpu size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">3. Especificaciones Técnicas</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identificadores físicos y perfil de hardware</p>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormGroup label="Modelo de Fabricante"><input name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej: L14 Gen 2" className="form-input" /></FormGroup>
            <FormGroup label="Número de Serie (S/N)"><input name="serialNumber" value={formData.serialNumber} onChange={handleChange} placeholder="S/N único" className="form-input" /></FormGroup>
            <FormGroup label="Perfil Dispositivo">
              <select name="dispositivo" value={formData.dispositivo} onChange={handleChange} className="form-input">
                {catalog.dispositivos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Estado de Etiquetado">
              <select name="etiq" value={formData.etiq} onChange={handleChange} className="form-input">
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="SI">SÍ (ETIQUETADO)</option>
                <option value="NO">NO (SIN ETIQUETA)</option>
              </select>
            </FormGroup>
            <div className="md:col-span-2">
              <FormGroup label="Características Técnicas Detalladas">
                <textarea name="caracteristicas" value={formData.caracteristicas} onChange={handleChange} rows={2} className="form-input min-h-[80px]" placeholder="Procesador, RAM, Disco, Pulgadas..."></textarea>
              </FormGroup>
            </div>
          </div>
        </section>

        {/* BLOQUE 4: FINANZAS Y AUDITORÍA (5 CAMPOS) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><CreditCard size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">4. Finanzas y Adquisición</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Control de inversión y facturación</p>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <FormGroup label="Tienda / Proveedor">
              <select name="tienda" value={formData.tienda} onChange={handleChange} className="form-input">
                {catalog.tiendas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Fecha de Compra"><input name="fechaCompra" type="date" value={formData.fechaCompra} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="Nº de Factura"><input name="factura" value={formData.factura} onChange={handleChange} placeholder="REF-001" className="form-input" /></FormGroup>
            <FormGroup label="Coste Bruto (€)"><input name="coste" value={formData.coste} onChange={handleChange} placeholder="0.00 €" className="form-input" /></FormGroup>
            <FormGroup label="Creado por (Audit)">
              <select name="creadoPor" value={formData.creadoPor} onChange={handleChange} className="form-input">
                {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
          </div>
        </section>

        {/* BLOQUE 5: CONECTIVIDAD Y LÍNEAS (10 CAMPOS) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Wifi size={20} /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">5. Comunicaciones y Red</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestión de tarjetas SIM y líneas móviles</p>
            </div>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <FormGroup label="ICCID Tarjeta SIM"><input name="tarjetaSim" value={formData.tarjetaSim} onChange={handleChange} placeholder="8934..." className="form-input" /></FormGroup>
            <FormGroup label="Fecha Alta Línea"><input name="conFecha" type="date" value={formData.conFecha} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="Compañía Operadora">
              <select name="compania" value={formData.compania} onChange={handleChange} className="form-input">
                {catalog.companias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Nº Teléfono"><input name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} placeholder="+34 6..." className="form-input" /></FormGroup>
            <FormGroup label="Tarifa Asociada"><input name="tarifa" value={formData.tarifa} onChange={handleChange} placeholder="Ilimitada / 100GB" className="form-input" /></FormGroup>
            <FormGroup label="IMEI Principal"><input name="imei1" value={formData.imei1} onChange={handleChange} placeholder="35..." className="form-input" /></FormGroup>
            <FormGroup label="IMEI Secundario"><input name="imei2" value={formData.imei2} onChange={handleChange} placeholder="35..." className="form-input" /></FormGroup>
            <FormGroup label="PIN SIM"><input name="pin" value={formData.pin} onChange={handleChange} placeholder="4 dígitos" className="form-input" /></FormGroup>
            <FormGroup label="Código PUK"><input name="puk" value={formData.puk} onChange={handleChange} placeholder="8 dígitos" className="form-input" /></FormGroup>
            <FormGroup label="ID de Línea / SIM"><input name="id" value={formData.id} disabled className="form-input bg-slate-50 cursor-not-allowed opacity-50" /></FormGroup>
          </div>
          <div className="px-10 pb-10">
              <FormGroup label="Descripción y Observaciones Finales">
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} className="form-input min-h-[100px]" placeholder="Notas adicionales sobre el activo..."></textarea>
              </FormGroup>
          </div>
        </section>

        {/* ACCIONES FINALES */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl border-t-[10px] border-t-blue-600">
            <div className="flex items-center gap-4 text-slate-500">
                <Info size={24} className="text-blue-600" />
                <p className="text-xs font-bold leading-relaxed">
                    Al confirmar, todos los campos (37) se guardarán en la base de datos.<br/>
                    El activo aparecerá inmediatamente en el inventario global.
                </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button type="button" onClick={onCancel} className="flex-1 md:flex-none px-12 py-4 rounded-xl font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest text-xs border border-transparent hover:border-slate-200">
                    Descartar
                </button>
                <button type="submit" className="flex-1 md:flex-none bg-blue-600 text-white px-16 py-4 rounded-xl font-black hover:bg-blue-700 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs active:scale-95">
                    <Save size={20} /> Finalizar Registro
                </button>
            </div>
        </div>
      </form>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        .form-input { 
          @apply w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-0 outline-none transition-all placeholder:text-slate-300; 
        }
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2.5">
    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">{label}</label>
    {children}
  </div>
);

export default InventoryForm;
