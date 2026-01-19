
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
  X
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
      alert("Error al acceder a la cámara. Asegúrate de dar permisos.");
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
              { text: "Eres un experto en inventario IT. Analiza la imagen y extrae datos técnicos. Devuelve solo un objeto JSON plano con las claves: equipo, modelo, serialNumber, tipo (elige el más cercano de: " + catalog.tipos.join(', ') + "). Si no ves algo, deja el valor vacío." }
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
      alert("Error al procesar la imagen con IA.");
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
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-2 text-sm font-bold">
            <ArrowLeft size={16} /> VOLVER AL LISTADO
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {initialData ? 'EDITAR ACTIVO' : 'REGISTRAR ACTIVO'}
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
          <div className="relative w-full max-w-lg bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 border-2 border-blue-500/30 pointer-events-none flex items-center justify-center">
               <div className="w-64 h-32 border-2 border-white/40 rounded-3xl animate-pulse"></div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
              <button onClick={stopCamera} className="bg-white/10 hover:bg-white/20 text-white p-5 rounded-3xl backdrop-blur-xl transition-all border border-white/10">
                <X size={28} />
              </button>
              <button onClick={captureAndScan} className="bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-3xl shadow-2xl shadow-blue-500/40 transition-all active:scale-90 border border-blue-400">
                <Camera size={28} />
              </button>
            </div>
          </div>
          <p className="text-white mt-8 font-black text-center uppercase tracking-widest text-xs opacity-60">Escaneo de activos via IA Vision</p>
        </div>
      )}

      {isProcessingImage && (
        <div className="fixed inset-0 z-[70] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="bg-blue-600/10 p-8 rounded-[3rem] animate-pulse mb-6">
            <Loader2 size={64} className="text-blue-600 animate-spin" />
          </div>
          <p className="font-black text-slate-900 uppercase tracking-[0.3em] text-sm">IA Analizando Activo...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden mb-8">
        <div className="p-10 min-h-[500px]">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-blue-600 font-black text-sm uppercase tracking-widest">
                  <Info size={20} /> Información Principal
                </div>
                <button type="button" onClick={startCamera} className="flex items-center gap-3 text-white bg-blue-600 px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase">
                  <Camera size={18} /> Vision Scan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label="ID de Activo" icon={<Hash size={16} />}>
                  <input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Ej: PT222" className="form-input" required />
                </FormGroup>
                <FormGroup label="Nombre / Equipo" icon={<Laptop size={16} />}>
                  <input name="equipo" value={formData.equipo} onChange={handleChange} placeholder="Ej: MacBook Pro M3" className="form-input" required />
                </FormGroup>
                <FormGroup label="Empresa Propietaria" icon={<Building size={16} />}>
                  <select name="empresa" value={formData.empresa} onChange={handleChange} className="form-input">
                    {catalog.empresas.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Tipo de Dispositivo">
                  <select name="tipo" value={formData.tipo} onChange={handleChange} className="form-input">
                    {catalog.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormGroup>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas Internas</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} className="form-input py-4" placeholder="Cualquier detalle relevante sobre la procedencia o uso..."></textarea>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-blue-600 font-black text-sm uppercase tracking-widest">
                <MapPin size={20} /> Logística y Asignación
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label="Usuario Responsable">
                  <input name="asignado" value={formData.asignado} onChange={handleChange} className="form-input" placeholder="Nombre completo" />
                </FormGroup>
                <FormGroup label="Email Corporativo">
                  <input name="correo" type="email" value={formData.correo} onChange={handleChange} className="form-input" placeholder="usuario@zubi.group" />
                </FormGroup>
                <FormGroup label="Ubicación">
                  <select name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="form-input">
                    {catalog.ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Estado de Uso">
                  <select name="estado" value={formData.estado} onChange={handleChange} className="form-input">
                    {catalog.estados.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Categoría Material">
                  <select name="material" value={formData.material} onChange={handleChange} className="form-input">
                    {catalog.materiales.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Fecha Registro" icon={<Clock size={16} />}>
                  <input name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="form-input" />
                </FormGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-blue-600 font-black text-sm uppercase tracking-widest">
                <Package size={20} /> Ficha de Hardware
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label="Modelo del Fabricante">
                  <input name="modelo" value={formData.modelo} onChange={handleChange} className="form-input" placeholder="P/N o Modelo" />
                </FormGroup>
                <FormGroup label="Nº Serie (S/N)">
                  <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="form-input" placeholder="Serial tag" />
                </FormGroup>
                <FormGroup label="Proveedor / Tienda">
                  <select name="tienda" value={formData.tienda} onChange={handleChange} className="form-input">
                    {catalog.tiendas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Inversión / Coste">
                  <input name="coste" value={formData.coste} onChange={handleChange} className="form-input" placeholder="0 €" />
                </FormGroup>
                <div className="md:col-span-2">
                   <FormGroup label="Configuración Técnica">
                     <textarea name="caracteristicas" value={formData.caracteristicas} onChange={handleChange} rows={3} className="form-input py-4" placeholder="RAM, Procesador, Almacenamiento..."></textarea>
                   </FormGroup>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-blue-600 font-black text-sm uppercase tracking-widest">
                <Wifi size={20} /> Conectividad / Móvil
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormGroup label="Tipo Dispositivo" icon={<Smartphone size={16}/>}>
                  <select name="dispositivo" value={formData.dispositivo} onChange={handleChange} className="form-input">
                    {catalog.dispositivos.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Línea / Teléfono">
                  <input name="numeroTelefono" value={formData.numeroTelefono} onChange={handleChange} className="form-input" placeholder="600 000 000" />
                </FormGroup>
                <FormGroup label="ICCID SIM">
                  <input name="tarjetaSim" value={formData.tarjetaSim} onChange={handleChange} className="form-input" />
                </FormGroup>
                <FormGroup label="Operador / Compañía">
                  <select name="compania" value={formData.compania} onChange={handleChange} className="form-input">
                    {catalog.companias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormGroup>
                <FormGroup label="Seguridad SIM (PIN/PUK)">
                  <div className="flex gap-3">
                    <input name="pin" value={formData.pin} onChange={handleChange} className="form-input" placeholder="PIN" />
                    <input name="puk" value={formData.puk} onChange={handleChange} className="form-input" placeholder="PUK" />
                  </div>
                </FormGroup>
                <FormGroup label="Confirmación Etiquetado">
                  <select name="etiq" value={formData.etiq} onChange={handleChange} className="form-input">
                    <option value="">No Etiquetado</option>
                    <option value="SI">Etiquetado Físico OK</option>
                  </select>
                </FormGroup>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button type="button" disabled={step === 1} onClick={() => setStep(step - 1)} className="px-8 py-3 rounded-2xl font-black text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all uppercase tracking-widest text-xs">
            Atrás
          </button>
          <div className="flex gap-4">
            {step < totalSteps ? (
              <button type="button" onClick={() => setStep(step + 1)} className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black hover:bg-black flex items-center gap-3 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs">
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-black hover:bg-blue-700 flex items-center gap-3 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 uppercase tracking-widest text-xs">
                <Save size={20} /> Finalizar
              </button>
            )}
          </div>
        </div>
      </form>
      <canvas ref={canvasRef} className="hidden" />
      <style>{`.form-input { @apply w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 focus:bg-white focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium; }`}</style>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ label, children, icon }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">{icon} {label}</label>
    {children}
  </div>
);

export default InventoryForm;
