
import React, { useState, useRef } from 'react';
import { InventoryItem, Catalog } from '../types';
import { GoogleGenAI } from '@google/genai';
import { 
  Save, 
  ArrowLeft, 
  ChevronRight, 
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
  DollarSign
} from 'lucide-react';

interface InventoryFormProps {
  onSubmit: (item: InventoryItem) => void;
  initialData: InventoryItem | null;
  catalog: Catalog;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onSubmit, initialData, catalog, onCancel }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
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
              { text: "Extrae: equipo, modelo, serialNumber, tipo (elige de: " + catalog.tipos.join(', ') + "). Devuelve JSON." }
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
      console.error(err);
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
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-2 text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Cancelar
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {initialData ? 'EDITAR ACTIVO' : 'NUEVO ACTIVO'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${step >= s ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'border-slate-200 text-slate-400 bg-white'}`}>
              <span className="font-bold text-sm">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-black rounded-[2.5rem] overflow-hidden shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <button onClick={stopCamera} className="bg-white/10 text-white p-5 rounded-3xl border border-white/10 hover:bg-white/20"><X size={28} /></button>
              <button onClick={captureAndScan} className="bg-blue-600 text-white p-5 rounded-3xl shadow-2xl border border-blue-400"><Camera size={28} /></button>
            </div>
          </div>
        </div>
      )}

      {isProcessingImage && (
        <div className="fixed inset-0 z-[70] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 size={64} className="text-blue-600 animate-spin mb-4" />
          <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Analizando Hardware...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-10 min-h-[550px]">
          {/* PASO 1: GENERAL & LEGAL */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center justify-between">
                <SectionHeader icon={<FileText size={20} />} title="Información General y Legal" />
                <button type="button" onClick={startCamera} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2">
                  <Camera size={16} /> IA Scan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Código Activo">
                  <input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="PT-XXX" className="form-input" required />
                </FormGroup>
                <FormGroup label="Nombre Equipo">
                  <input name="equipo" value={formData.equipo} onChange={handleChange} placeholder="Nombre descriptivo" className="form-input" required />
                </FormGroup>
                <FormGroup label="Empresa Legal">
                  <select name="empresa" value={formData.empresa} onChange={handleChange} className="form-input">
                    {catalog.empresas.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="CIF Empresa">
                  <input name="cif" value={formData.cif} onChange={handleChange} placeholder="CIF/NIF" className="form-input" />
                </FormGroup>
                <FormGroup label="Propiedad De">
                  <select name="propiedad" value={formData.propiedad} onChange={handleChange} className="form-input">
                    {catalog.propiedades.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Tipo Activo">
                  <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input">
                    {catalog.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormGroup>
                <div className="md:col-span-2">
                  <FormGroup label="Descripción General">
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="form-input" placeholder="Notas adicionales..."></textarea>
                  </FormGroup>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: LOGÍSTICA & ASIGNACIÓN */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in">
              <SectionHeader icon={<User size={20} />} title="Logística y Asignación" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Asignado a (Dueño)">
                  <input name="asignado" value={formData.asignado} onChange={handleChange} className="form-input" placeholder="Usuario final" />
                </FormGroup>
                <FormGroup label="Responsable IT">
                  <select name="responsable" value={formData.responsable} onChange={handleChange} className="form-input">
                    {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Correo Corporativo">
                  <input name="correo" type="email" value={formData.correo} onChange={handleChange} className="form-input" placeholder="email@dominio.com" />
                </FormGroup>
                <FormGroup label="Correo SSO">
                  <input name="correoSso" value={formData.correoSso} onChange={handleChange} className="form-input" placeholder="SSO Email" />
                </FormGroup>
                <FormGroup label="Ubicación Física">
                  <select name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="form-input">
                    {catalog.ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Estatus ADM">
                  <input name="adm" value={formData.adm} onChange={handleChange} className="form-input" placeholder="ADM Status" />
                </FormGroup>
                <FormGroup label="Estado Operativo">
                  <select name="estado" value={formData.estado} onChange={handleChange} className="form-input">
                    {catalog.estados.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Tipo Material">
                  <select name="material" value={formData.material} onChange={handleChange} className="form-input">
                    {catalog.materiales.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Fecha Asignación">
                  <input name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="form-input" />
                </FormGroup>
                <FormGroup label="Uso BYOD?">
                  <select name="byod" value={formData.byod} onChange={handleChange} className="form-input">
                    <option value="">No</option>
                    <option value="SI">Sí</option>
                  </select>
                </FormGroup>
                <FormGroup label="Anterior Dueño (Before)">
                  <input name="before" value={formData.before} onChange={handleChange} className="form-input" placeholder="Dueño previo" />
                </FormGroup>
                <FormGroup label="Etiquetado">
                  <select name="etiq" value={formData.etiq} onChange={handleChange} className="form-input">
                    <option value="">NO</option>
                    <option value="SI">SÍ</option>
                  </select>
                </FormGroup>
              </div>
            </div>
          )}

          {/* PASO 3: HARDWARE & FINANZAS */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in">
              <SectionHeader icon={<Package size={20} />} title="Especificaciones y Finanzas" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Fabricante / Modelo">
                  <input name="modelo" value={formData.modelo} onChange={handleChange} className="form-input" placeholder="Modelo exacto" />
                </FormGroup>
                <FormGroup label="Número de Serie (SN)">
                  <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="form-input" placeholder="S/N" />
                </FormGroup>
                <FormGroup label="Categoría Dispositivo">
                  <select name="dispositivo" value={formData.dispositivo} onChange={handleChange} className="form-input">
                    {catalog.dispositivos.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Creado Por">
                  <select name="creadoPor" value={formData.creadoPor} onChange={handleChange} className="form-input">
                    {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Proveedor / Tienda">
                  <select name="tienda" value={formData.tienda} onChange={handleChange} className="form-input">
                    {catalog.tiendas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Inversión (Coste)">
                  <input name="coste" value={formData.coste} onChange={handleChange} className="form-input" placeholder="0 €" />
                </FormGroup>
                <FormGroup label="Fecha Compra">
                  <input name="fechaCompra" type="date" value={formData.fechaCompra} onChange={handleChange} className="form-input" />
                </FormGroup>
                <FormGroup label="Factura Referencia">
                  <input name="factura" value={formData.factura} onChange={handleChange} className="form-input" placeholder="Nº Factura" />
                </FormGroup>
                <div className="md:col-span-2">
                   <FormGroup label="Características Técnicas">
                     <textarea name="caracteristicas" value={formData.caracteristicas} onChange={handleChange} rows={3} className="form-input" placeholder="RAM, Procesador, SSD..."></textarea>
                   </FormGroup>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: RED & CONECTIVIDAD */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in">
              <SectionHeader icon={<Wifi size={20} />} title="Red y Conectividad" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Línea / Teléfono">
                  <input name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} className="form-input" placeholder="600 000 000" />
                </FormGroup>
                <FormGroup label="Operador">
                  <select name="compania" value={formData.compania} onChange={handleChange} className="form-input">
                    {catalog.companias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="ICCID SIM">
                  <input name="tarjetaSim" value={formData.tarjetaSim} onChange={handleChange} className="form-input" placeholder="SIM Number" />
                </FormGroup>
                <FormGroup label="Con Fecha SIM">
                  <input name="conFecha" value={formData.conFecha} onChange={handleChange} className="form-input" placeholder="Fecha contrato SIM" />
                </FormGroup>
                <FormGroup label="Tarifa Actual">
                  <input name="tarifa" value={formData.tarifa} onChange={handleChange} className="form-input" placeholder="Nombre Tarifa" />
                </FormGroup>
                <FormGroup label="IMEI 1">
                  <input name="imei1" value={formData.imei1} onChange={handleChange} className="form-input" placeholder="IMEI principal" />
                </FormGroup>
                <FormGroup label="IMEI 2">
                  <input name="imei2" value={formData.imei2} onChange={handleChange} className="form-input" placeholder="IMEI secundario" />
                </FormGroup>
                <FormGroup label="Seguridad SIM (PIN/PUK)">
                  <div className="flex gap-3">
                    <input name="pin" value={formData.pin} onChange={handleChange} className="form-input" placeholder="PIN" />
                    <input name="puk" value={formData.puk} onChange={handleChange} className="form-input" placeholder="PUK" />
                  </div>
                </FormGroup>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button type="button" disabled={step === 1} onClick={() => setStep(step - 1)} className="px-8 py-3 rounded-2xl font-black text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all uppercase tracking-widest text-[10px]">
            Atrás
          </button>
          <div className="flex gap-4">
            {step < totalSteps ? (
              <button type="button" onClick={() => setStep(step + 1)} className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black hover:bg-black flex items-center gap-3 transition-all shadow-xl uppercase tracking-widest text-[10px]">
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black hover:bg-blue-700 flex items-center gap-3 shadow-2xl transition-all uppercase tracking-widest text-[10px]">
                <Save size={20} /> Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </form>
      <canvas ref={canvasRef} className="hidden" />
      <style>{`.form-input { @apply w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-300; }`}</style>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 text-blue-600 font-black text-sm uppercase tracking-widest">
    {icon} {title}
  </div>
);

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

export default InventoryForm;
