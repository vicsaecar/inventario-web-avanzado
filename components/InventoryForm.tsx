
import React, { useState, useRef } from 'react';
import { InventoryItem, Catalog } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Save, ArrowLeft, Camera, Loader2, X, FileText, User, Cpu, Wifi, CreditCard, Info } from 'lucide-react';

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
      ID: 0, CODIGO: '', EQUIPO: '', EMPRESA: catalog.empresas[0] || '', DESCRIPCION: '',
      TIPO: catalog.tipos[0] || '', PROPIEDAD: catalog.propiedades[0] || '',
      CIF: catalog.cifs[0] || '', ASIGNADO: 'Sin asignar', CORREO: '', ADM: '',
      FECHA: new Date().toISOString().split('T')[0], UBICACION: catalog.ubicaciones[0] || '',
      ESTADO: catalog.estados[0] || '', MATERIAL: catalog.materiales[0] || '',
      BEFORE: '', BYOD: 'NO', MODELO: '', SERIAL_NUMBER: '',
      CARACTERISTICAS: '', TIENDA: catalog.tiendas[0] || '', FECHA_COMPRA: '',
      FACTURA: '', COSTE: '0 €', CREADO_POR: catalog.creadores[0] || '',
      RESPONSABLE: catalog.creadores[0] || '', DISPOSITIVO: catalog.dispositivos[0] || '', TARJETA_SIM: '',
      CON_FECHA: '', COMPAÑIA: catalog.companias[0] || '', PIN: '',
      Nº_TELEFONO: '', PUK: '', TARIFA: '', IMEI_1: '', IMEI_2: '',
      CORREO_SSO: '', ETIQ: 'PENDIENTE'
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Error cámara"); setIsScanning(false); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
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
        contents: [{ parts: [{ inlineData: { data: base64Data, mimeType: 'image/jpeg' } }, { text: "Extract: EQUIPO, MODELO, SERIAL_NUMBER. Result JSON." }] }],
      });
      const result = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      setFormData(prev => ({ ...prev, EQUIPO: result.EQUIPO || prev.EQUIPO, MODELO: result.MODELO || prev.MODELO, SERIAL_NUMBER: result.SERIAL_NUMBER || prev.SERIAL_NUMBER }));
    } catch (err) { console.error(err); } finally { setIsProcessingImage(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as InventoryItem);
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="sticky top-[-1.5rem] z-[40] bg-slate-50/95 backdrop-blur-md pt-6 pb-6 px-4 -mx-4 border-b border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all mb-1 text-xs font-black uppercase tracking-widest"><ArrowLeft size={14} /> Volver</button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">REGISTRO SINCRONIZADO</h2>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={startCamera} className="bg-white border-2 border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase flex items-center gap-2 shadow-sm"><Camera size={16} /> Scan IA</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all uppercase text-xs active:scale-95"><Save size={18} /> Guardar</button>
        </div>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[60] bg-slate-900/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-black rounded-[2rem] overflow-hidden border-4 border-white/20">
            <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
              <button onClick={stopCamera} className="bg-white/20 text-white p-4 rounded-full"><X size={24} /></button>
              <button onClick={captureAndScan} className="bg-blue-600 text-white p-4 rounded-full"><Camera size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {isProcessingImage && (
        <div className="fixed inset-0 z-[70] bg-white/95 flex flex-col items-center justify-center">
          <Loader2 size={64} className="text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Sincronizando Campos...</h3>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        <section className="form-section border-blue-600">
          <SectionHeader icon={<FileText size={20}/>} title="1. Identidad y Marco Legal" />
          <div className="form-grid lg:grid-cols-3">
            <FormGroup label="CODIGO"><input name="CODIGO" value={formData.CODIGO} onChange={handleChange} className="form-input" required /></FormGroup>
            <FormGroup label="EQUIPO"><input name="EQUIPO" value={formData.EQUIPO} onChange={handleChange} className="form-input" required /></FormGroup>
            <FormGroup label="EMPRESA">
              <select name="EMPRESA" value={formData.EMPRESA} onChange={handleChange} className="form-input">
                {catalog.empresas.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="CIF">
              <select name="CIF" value={formData.CIF} onChange={handleChange} className="form-input">
                {catalog.cifs.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="TIPO">
              <select name="TIPO" value={formData.TIPO} onChange={handleChange} className="form-input">
                {catalog.tipos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="PROPIEDAD">
              <select name="PROPIEDAD" value={formData.PROPIEDAD} onChange={handleChange} className="form-input">
                {catalog.propiedades.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormGroup>
          </div>
        </section>

        <section className="form-section border-emerald-600">
          <SectionHeader icon={<User size={20}/>} title="2. Asignación y Operativa" />
          <div className="form-grid lg:grid-cols-4">
            <FormGroup label="ASIGNADO"><input name="ASIGNADO" value={formData.ASIGNADO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="RESPONSABLE">
              <select name="RESPONSABLE" value={formData.RESPONSABLE} onChange={handleChange} className="form-input">
                {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="CORREO"><input name="CORREO" type="email" value={formData.CORREO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CORREO_SSO"><input name="CORREO_SSO" value={formData.CORREO_SSO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="ADM"><input name="ADM" value={formData.ADM} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="FECHA"><input name="FECHA" type="date" value={formData.FECHA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="UBICACION">
              <select name="UBICACION" value={formData.UBICACION} onChange={handleChange} className="form-input">
                {catalog.ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="ESTADO">
              <select name="ESTADO" value={formData.ESTADO} onChange={handleChange} className="form-input">
                {catalog.estados.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="MATERIAL">
              <select name="MATERIAL" value={formData.MATERIAL} onChange={handleChange} className="form-input">
                {catalog.materiales.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="BEFORE"><input name="BEFORE" value={formData.BEFORE} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="BYOD"><input name="BYOD" value={formData.BYOD} onChange={handleChange} className="form-input" /></FormGroup>
          </div>
        </section>

        <section className="form-section border-amber-600">
          <SectionHeader icon={<Cpu size={20}/>} title="3. Técnico y Hardware" />
          <div className="form-grid lg:grid-cols-3">
            <FormGroup label="MODELO"><input name="MODELO" value={formData.MODELO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="SERIAL_NUMBER"><input name="SERIAL_NUMBER" value={formData.SERIAL_NUMBER} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="DISPOSITIVO">
              <select name="DISPOSITIVO" value={formData.DISPOSITIVO} onChange={handleChange} className="form-input">
                {catalog.dispositivos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="ETIQ"><input name="ETIQ" value={formData.ETIQ} onChange={handleChange} className="form-input" /></FormGroup>
            <div className="md:col-span-2">
              <FormGroup label="CARACTERISTICAS"><textarea name="CARACTERISTICAS" value={formData.CARACTERISTICAS} onChange={handleChange} rows={2} className="form-input" /></FormGroup>
            </div>
          </div>
        </section>

        <section className="form-section border-indigo-600">
          <SectionHeader icon={<CreditCard size={20}/>} title="4. Finanzas" />
          <div className="form-grid lg:grid-cols-4">
            <FormGroup label="TIENDA">
              <select name="TIENDA" value={formData.TIENDA} onChange={handleChange} className="form-input">
                {catalog.tiendas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="FECHA_COMPRA"><input name="FECHA_COMPRA" type="date" value={formData.FECHA_COMPRA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="FACTURA"><input name="FACTURA" value={formData.FACTURA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="COSTE"><input name="COSTE" value={formData.COSTE} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CREADO_POR">
              <select name="CREADO_POR" value={formData.CREADO_POR} onChange={handleChange} className="form-input">
                {catalog.creadores.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
          </div>
        </section>

        <section className="form-section border-sky-600">
          <SectionHeader icon={<Wifi size={20}/>} title="5. Comunicaciones" />
          <div className="form-grid lg:grid-cols-4">
            <FormGroup label="TARJETA_SIM"><input name="TARJETA_SIM" value={formData.TARJETA_SIM} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CON_FECHA"><input name="CON_FECHA" type="date" value={formData.CON_FECHA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="COMPAÑIA">
              <select name="COMPAÑIA" value={formData.COMPAÑIA} onChange={handleChange} className="form-input">
                {catalog.companias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Nº_TELEFONO"><input name="Nº_TELEFONO" value={formData.Nº_TELEFONO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="PIN"><input name="PIN" value={formData.PIN} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="PUK"><input name="PUK" value={formData.PUK} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="TARIFA"><input name="TARIFA" value={formData.TARIFA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="IMEI 1"><input name="IMEI_1" value={formData.IMEI_1} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="IMEI 2"><input name="IMEI_2" value={formData.IMEI_2} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="ID"><input name="ID" value={formData.ID} disabled className="form-input opacity-40" /></FormGroup>
          </div>
          <div className="px-10 pb-10">
              <FormGroup label="DESCRIPCION"><textarea name="DESCRIPCION" value={formData.DESCRIPCION} onChange={handleChange} rows={2} className="form-input" /></FormGroup>
          </div>
        </section>

        <div className="p-10 bg-white rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-slate-500">
                <Info size={24} className="text-blue-600" />
                <p className="text-xs font-bold uppercase tracking-tight italic">Sincronizando 38 campos con Google Sheets.</p>
            </div>
            <button type="submit" className="w-full md:w-auto px-16 py-4 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-2xl transition-all uppercase text-xs active:scale-95">Guardar en la Nube</button>
        </div>
      </form>
      <canvas ref={canvasRef} className="hidden" />
      <style>{`.form-section { @apply bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden border-l-[12px]; } .form-grid { @apply p-10 grid grid-cols-1 md:grid-cols-2 gap-8; } .form-input { @apply w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-blue-600 outline-none transition-all; }`}</style>
    </div>
  );
};

const SectionHeader: React.FC<any> = ({ icon, title }) => (
  <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
    <div className="bg-white p-3 rounded-xl shadow-sm text-slate-600">{icon}</div>
    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
  </div>
);

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2.5">
    <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">{label}</label>
    {children}
  </div>
);

export default InventoryForm;
