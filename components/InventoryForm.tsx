
import React, { useState, useRef } from 'react';
import { InventoryItem, Catalog } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Save, ArrowLeft, Camera, Loader2, X, FileText, User, Cpu, Wifi, CreditCard, Info, Copy } from 'lucide-react';

interface InventoryFormProps {
  onSubmit: (item: InventoryItem) => void;
  initialData: InventoryItem | null;
  catalog: Catalog;
  onCancel: () => void;
  inventory: InventoryItem[];
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onSubmit, initialData, catalog, onCancel, inventory }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    initialData || {
      ID: 0, CODIGO: '', EQUIPO: '', EMPRESA: catalog.EMPRESA[0], DESCRIPCION: '',
      TIPO: catalog.TIPO[0], PROPIEDAD: catalog.PROPIEDAD[0],
      CIF: catalog.CIF_EMPRESA[0], ASIGNADO: 'Sin asignar', CORREO: '', ADM: '',
      FECHA: new Date().toISOString().split('T')[0], UBICACION: catalog.UBICACION[0],
      ESTADO: catalog.ESTADO[0], MATERIAL: catalog.MATERIAL[0],
      BEFORE: '', BYOD: catalog.BYOD[0] || 'NO', MODELO: '', SERIAL_NUMBER: '',
      CARACTERISTICAS: '', TIENDA: catalog.PROVEEDOR[0], FECHA_COMPRA: '',
      FACTURA: '', COSTE: '0 €', CREADO_POR: catalog.CREADO_POR[0],
      RESPONSABLE: catalog.CREADO_POR[0], DISPOSITIVO: catalog.DISPOSITIVO[0], TARJETA_SIM: '',
      CON_FECHA: '', COMPAÑIA: catalog.COMPAÑIA[0], PIN: '',
      Nº_TELEFONO: '', PUK: '', TARIFA: '', IMEI_1: '', IMEI_2: '',
      CORREO_SSO: '', ETIQ: 'PENDIENTE'
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as InventoryItem);
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
      setFormData(prev => ({ 
        ...prev, 
        EQUIPO: result.EQUIPO || prev.EQUIPO, 
        MODELO: result.MODELO || prev.MODELO, 
        SERIAL_NUMBER: result.SERIAL_NUMBER || prev.SERIAL_NUMBER 
      }));
    } catch (err) { console.error(err); } finally { setIsProcessingImage(false); }
  };

  const handleReplicateLast = (deviceType: string) => {
    if (!deviceType) return;
    
    // Normalizamos para búsqueda insensible a mayúsculas/espacios
    const target = deviceType.trim().toLowerCase();
    
    // Buscar el último registro que coincida con el DISPOSITIVO seleccionado
    const lastMatch = [...inventory].reverse().find(i => 
        (i.DISPOSITIVO || '').trim().toLowerCase() === target
    );

    if (lastMatch) {
        // Rellenamos el formulario inmediatamente con los datos del registro encontrado
        // Reiniciamos ID para que cuente como nuevo registro
        setFormData({ ...lastMatch, ID: 0 });
    } else {
      alert(`No se encontraron registros previos para el dispositivo: ${deviceType}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="sticky top-[-1.5rem] z-[40] bg-slate-50/95 backdrop-blur-md pt-6 pb-6 px-4 -mx-4 border-b border-slate-200 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all mb-1 text-xs font-black uppercase tracking-widest"><ArrowLeft size={14} /> Volver</button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">REGISTRO SINCRONIZADO</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón/Selector para Replicar Último Registro */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Copy size={14} className="text-slate-500" />
            </div>
            <select
                onChange={(e) => {
                    handleReplicateLast(e.target.value);
                    e.target.value = ''; // Resetear el selector para permitir re-selección del mismo valor
                }}
                className="bg-white border-2 border-slate-200 text-slate-600 pl-9 pr-8 py-2.5 rounded-xl text-xs font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase appearance-none cursor-pointer shadow-sm outline-none focus:ring-2 focus:ring-blue-500 w-40 truncate"
                defaultValue=""
            >
                <option value="" disabled>DISPOSITIVO</option>
                {catalog.DISPOSITIVO.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button type="button" onClick={startCamera} className="bg-white border-2 border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black hover:border-blue-600 hover:text-blue-600 transition-all uppercase flex items-center gap-2 shadow-sm"><Camera size={16} /> Scan IA</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all uppercase text-xs active:scale-95"><Save size={18} /> Guardar</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* 1. Marco Corporativo */}
        <section className="form-section border-blue-600">
          <SectionHeader icon={<FileText size={20}/>} title="1. Identidad y Marco Legal" />
          <div className="form-grid lg:grid-cols-3">
            <FormGroup label="CÓDIGO (CODIGO)"><input name="CODIGO" value={formData.CODIGO} onChange={handleChange} className="form-input" required /></FormGroup>
            <FormGroup label="EQUIPO"><input name="EQUIPO" value={formData.EQUIPO} onChange={handleChange} className="form-input" required /></FormGroup>
            <FormGroup label="EMPRESA">
              <select name="EMPRESA" value={formData.EMPRESA} onChange={handleChange} className="form-input">
                {catalog.EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="CIF_EMPRESA">
              <select name="CIF" value={formData.CIF} onChange={handleChange} className="form-input">
                {catalog.CIF_EMPRESA.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="TIPO">
              <select name="TIPO" value={formData.TIPO} onChange={handleChange} className="form-input">
                {catalog.TIPO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="PROPIEDAD">
              <select name="PROPIEDAD" value={formData.PROPIEDAD} onChange={handleChange} className="form-input">
                {catalog.PROPIEDAD.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormGroup>
          </div>
        </section>

        {/* 2. Asignación y Operativa */}
        <section className="form-section border-emerald-600">
          <SectionHeader icon={<User size={20}/>} title="2. Asignación y Operativa" />
          <div className="form-grid lg:grid-cols-4">
            <FormGroup label="ASIGNADO A"><input name="ASIGNADO" value={formData.ASIGNADO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CORREO"><input name="CORREO" type="email" value={formData.CORREO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CORREO_SSO"><input name="CORREO_SSO" value={formData.CORREO_SSO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="RESPONSABLE (CREADO_POR)">
              <select name="RESPONSABLE" value={formData.RESPONSABLE} onChange={handleChange} className="form-input">
                {catalog.CREADO_POR.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="UBICACIÓN (UBICACION)">
              <select name="UBICACION" value={formData.UBICACION} onChange={handleChange} className="form-input">
                {catalog.UBICACION.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="ESTADO">
              <select name="ESTADO" value={formData.ESTADO} onChange={handleChange} className="form-input">
                {catalog.ESTADO.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="MATERIAL">
              <select name="MATERIAL" value={formData.MATERIAL} onChange={handleChange} className="form-input">
                {catalog.MATERIAL.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="FECHA ALTA (FECHA)"><input name="FECHA" type="date" value={formData.FECHA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="ADM"><input name="ADM" value={formData.ADM} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="BEFORE"><input name="BEFORE" value={formData.BEFORE} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="BYOD">
              <select name="BYOD" value={formData.BYOD} onChange={handleChange} className="form-input">
                {catalog.BYOD.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="ETIQUETA (ETIQ)"><input name="ETIQ" value={formData.ETIQ} onChange={handleChange} className="form-input" /></FormGroup>
          </div>
        </section>

        {/* 3. Hardware y Técnico */}
        <section className="form-section border-amber-600">
          <SectionHeader icon={<Cpu size={20}/>} title="3. Especificaciones Técnicas" />
          <div className="form-grid lg:grid-cols-3">
            <FormGroup label="MODELO"><input name="MODELO" value={formData.MODELO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="Nº SERIE (SERIAL_NUMBER)"><input name="SERIAL_NUMBER" value={formData.SERIAL_NUMBER} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="DISPOSITIVO">
              <select name="DISPOSITIVO" value={formData.DISPOSITIVO} onChange={handleChange} className="form-input">
                {catalog.DISPOSITIVO.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormGroup>
            <div className="md:col-span-3">
              <FormGroup label="CARACTERÍSTICAS TÉCNICAS"><textarea name="CARACTERISTICAS" value={formData.CARACTERISTICAS} onChange={handleChange} rows={2} className="form-input" /></FormGroup>
            </div>
          </div>
        </section>

        {/* 4. Conectividad y SIM */}
        <section className="form-section border-sky-600">
          <SectionHeader icon={<Wifi size={20}/>} title="4. Comunicaciones y Telefonía" />
          <div className="form-grid lg:grid-cols-4">
            <FormGroup label="Nº TELÉFONO"><input name="Nº_TELEFONO" value={formData.Nº_TELEFONO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="COMPAÑÍA">
              <select name="COMPAÑIA" value={formData.COMPAÑIA} onChange={handleChange} className="form-input">
                {catalog.COMPAÑIA.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="TARIFA"><input name="TARIFA" value={formData.TARIFA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="TARJETA_SIM (ICCID)"><input name="TARJETA_SIM" value={formData.TARJETA_SIM} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="PIN"><input name="PIN" value={formData.PIN} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="PUK"><input name="PUK" value={formData.PUK} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="FECHA SIM (CON_FECHA)"><input name="CON_FECHA" type="date" value={formData.CON_FECHA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="IMEI_1"><input name="IMEI_1" value={formData.IMEI_1} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="IMEI_2"><input name="IMEI_2" value={formData.IMEI_2} onChange={handleChange} className="form-input" /></FormGroup>
          </div>
        </section>

        {/* 5. Gestión Financiera */}
        <section className="form-section border-indigo-600">
          <SectionHeader icon={<CreditCard size={20}/>} title="5. Finanzas e Historial" />
          <div className="form-grid lg:grid-cols-4">
            <FormGroup label="PROVEEDOR">
              <select name="TIENDA" value={formData.TIENDA} onChange={handleChange} className="form-input">
                {catalog.PROVEEDOR.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="FECHA COMPRA"><input name="FECHA_COMPRA" type="date" value={formData.FECHA_COMPRA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="FACTURA"><input name="FACTURA" value={formData.FACTURA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="COSTE (€)"><input name="COSTE" value={formData.COSTE} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CREADO_POR">
              <select name="CREADO_POR" value={formData.CREADO_POR} onChange={handleChange} className="form-input">
                {catalog.CREADO_POR.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <div className="md:col-span-2 lg:col-span-4">
              <FormGroup label="DESCRIPCIÓN ADICIONAL"><textarea name="DESCRIPCION" value={formData.DESCRIPCION} onChange={handleChange} rows={2} className="form-input" /></FormGroup>
            </div>
          </div>
        </section>

        <div className="p-10 bg-white rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-slate-500">
                <Info size={24} className="text-blue-600" />
                <p className="text-xs font-bold uppercase tracking-tight italic">Los cambios se guardarán automáticamente en la pestaña 'inventario'.</p>
            </div>
            <button type="submit" className="w-full md:w-auto px-16 py-4 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-2xl transition-all uppercase text-xs active:scale-95">Guardar en Cloud</button>
        </div>
      </form>
      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        .form-section { 
          @apply bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden border-l-[12px]; 
        } 
        .form-grid { 
          @apply p-10 grid grid-cols-1 md:grid-cols-2 gap-8; 
        } 
        
        /* ESTILOS FORZADOS PARA INPUTS DE ALTO CONTRASTE */
        .form-input { 
          width: 100%; 
          background-color: #ffffff !important; /* Fondo blanco puro */
          color: #000000 !important; /* Texto negro puro */
          border: 2px solid #cbd5e1 !important; /* Borde slate-300 visible */
          border-radius: 0.75rem; 
          padding: 0.75rem 1rem; 
          font-size: 0.875rem; 
          font-weight: 700; 
          outline: none; 
          transition: all 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }
        
        .form-input:focus { 
          border-color: #2563eb !important; 
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        /* Icono personalizado para selects para garantizar visibilidad en fondo blanco */
        select.form-input {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23000000' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
          padding-right: 2.5rem;
        }
        
        ::placeholder {
          color: #94a3b8 !important; /* Slate 400 */
          opacity: 1;
        }
      `}</style>
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
