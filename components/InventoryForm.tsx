
import React, { useState, useRef } from 'react';
import { InventoryItem, Catalog } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Save, ArrowLeft, Camera, Loader2, X, Info, Copy, FileSpreadsheet, Wand2 } from 'lucide-react';

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

  // Definimos el estado base (vacío) para poder resetear el formulario antes de volcar datos.
  const defaultFormData: InventoryItem = {
      ID: 0, CODIGO: '', EQUIPO: '', EMPRESA: '', DESCRIPCION: '',
      TIPO: '', PROPIEDAD: '',
      CIF: '', ASIGNADO: '', CORREO: '', ADM: '',
      FECHA: '', UBICACION: '',
      ESTADO: '', MATERIAL: '',
      BEFORE: '', BYOD: '', MODELO: '', SERIAL_NUMBER: '',
      CARACTERISTICAS: '', TIENDA: '', FECHA_COMPRA: '',
      FACTURA: '', COSTE: '', CREADO_POR: '',
      RESPONSABLE: '', DISPOSITIVO: '', TARJETA_SIM: '',
      CON_FECHA: '', COMPAÑIA: '', PIN: '',
      Nº_TELEFONO: '', PUK: '', TARIFA: '', IMEI_1: '', IMEI_2: '',
      CORREO_SSO: '', ETIQ: ''
  };

  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    initialData || defaultFormData
  );

  // Función para calcular el siguiente código basado en el prefijo
  const generateNextCode = (typeValue: string): string => {
    if (!typeValue) return '';
    
    // Extraemos el prefijo. Ej: de "PT_Portatil" sacamos "PT"
    const prefix = typeValue.split('_')[0]; 
    if (!prefix) return '';

    // Buscamos el número más alto existente para ese prefijo
    let maxNum = 0;
    
    inventory.forEach(item => {
        const code = item.CODIGO ? String(item.CODIGO).trim() : '';
        // Verificamos si el código empieza por el prefijo seleccionado
        if (code.toUpperCase().startsWith(prefix.toUpperCase())) {
            // Extraemos solo los números del código
            const match = code.match(/(\d+)/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        }
    });

    // Retornamos prefijo + (máximo encontrado + 1)
    return `${prefix}${maxNum + 1}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
        const nextState = { ...prev, [name]: value };

        // Lógica automática: Si cambiamos el TIPO y es un registro nuevo (o no tiene código manual aún)
        // Calculamos el siguiente código automáticamente
        if (name === 'TIPO' && (!initialData || initialData.ID === 0)) {
            const nextCode = generateNextCode(value);
            if (nextCode) {
                nextState.CODIGO = nextCode;
            }
        }

        return nextState;
    });
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
    const target = deviceType.trim().toLowerCase();
    const lastMatch = [...inventory].reverse().find(i => 
        (i.DISPOSITIVO || '').trim().toLowerCase() === target
    );

    if (lastMatch) {
        // Al copiar un registro anterior, también obtenemos su TIPO.
        // Calculamos el nuevo código consecutivo basado en ese TIPO.
        const nextCode = generateNextCode(lastMatch.TIPO);

        setFormData(prev => ({ 
            ...defaultFormData, 
            ...lastMatch, 
            ID: 0,
            // Asignamos el código calculado. Si falla, mantenemos lo que hubiera o vacío.
            CODIGO: nextCode || prev.CODIGO || '' 
        }));
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
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Copy size={14} className="text-slate-500" />
            </div>
            <select
                onChange={(e) => {
                    handleReplicateLast(e.target.value);
                    e.target.value = '';
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

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
            <div className="bg-slate-50 p-3 rounded-xl text-slate-500"><FileSpreadsheet size={20}/></div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">DATOS DEL ACTIVO</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6">
            <FormGroup label="CODIGO">
                <div className="relative">
                    <input name="CODIGO" value={formData.CODIGO} onChange={handleChange} className="form-input pr-10" required placeholder="Se genera auto..." />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                        <Wand2 size={14} />
                    </div>
                </div>
            </FormGroup>
            <FormGroup label="TIPO">
                <select name="TIPO" value={formData.TIPO} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar TIPO...</option>
                    {catalog.TIPO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="EQUIPO"><input name="EQUIPO" value={formData.EQUIPO} onChange={handleChange} className="form-input" required /></FormGroup>
            <FormGroup label="EMPRESA">
                <select name="EMPRESA" value={formData.EMPRESA} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="DESCRIPCION"><textarea name="DESCRIPCION" value={formData.DESCRIPCION} onChange={handleChange} rows={1} className="form-input h-[46px] pt-2.5" /></FormGroup>
            
            <FormGroup label="PROPIEDAD">
                <select name="PROPIEDAD" value={formData.PROPIEDAD} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.PROPIEDAD.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="CIF">
                <select name="CIF" value={formData.CIF} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.CIF_EMPRESA.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="ASIGNADO"><input name="ASIGNADO" value={formData.ASIGNADO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CORREO"><input name="CORREO" type="email" value={formData.CORREO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="ADM"><input name="ADM" value={formData.ADM} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="FECHA"><input name="FECHA" type="date" value={formData.FECHA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="UBICACION">
                <select name="UBICACION" value={formData.UBICACION} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.UBICACION.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="ESTADO">
                <select name="ESTADO" value={formData.ESTADO} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.ESTADO.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="MATERIAL">
                <select name="MATERIAL" value={formData.MATERIAL} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.MATERIAL.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="BEFORE"><input name="BEFORE" value={formData.BEFORE} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="BYOD">
                <select name="BYOD" value={formData.BYOD} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    <option value="NO">NO</option>
                    {catalog.BYOD.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="MODELO"><input name="MODELO" value={formData.MODELO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="SERIAL_NUMBER"><input name="SERIAL_NUMBER" value={formData.SERIAL_NUMBER} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CARACTERISTICAS"><textarea name="CARACTERISTICAS" value={formData.CARACTERISTICAS} onChange={handleChange} rows={1} className="form-input h-[46px] pt-2.5" /></FormGroup>
            <FormGroup label="TIENDA">
                <select name="TIENDA" value={formData.TIENDA} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.PROVEEDOR.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="FECHA_COMPRA"><input name="FECHA_COMPRA" type="date" value={formData.FECHA_COMPRA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="FACTURA"><input name="FACTURA" value={formData.FACTURA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="COSTE"><input name="COSTE" value={formData.COSTE} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CREADO_POR">
                <select name="CREADO_POR" value={formData.CREADO_POR} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.CREADO_POR.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="RESPONSABLE">
                <select name="RESPONSABLE" value={formData.RESPONSABLE} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.CREADO_POR.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="DISPOSITIVO">
                <select name="DISPOSITIVO" value={formData.DISPOSITIVO} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.DISPOSITIVO.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="TARJETA_SIM"><input name="TARJETA_SIM" value={formData.TARJETA_SIM} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CON_FECHA"><input name="CON_FECHA" type="date" value={formData.CON_FECHA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="COMPAÑIA">
                <select name="COMPAÑIA" value={formData.COMPAÑIA} onChange={handleChange} className="form-input">
                    <option value="">Seleccionar...</option>
                    {catalog.COMPAÑIA.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </FormGroup>
            <FormGroup label="PIN"><input name="PIN" value={formData.PIN} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="Nº_TELEFONO"><input name="Nº_TELEFONO" value={formData.Nº_TELEFONO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="PUK"><input name="PUK" value={formData.PUK} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="TARIFA"><input name="TARIFA" value={formData.TARIFA} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="IMEI 1"><input name="IMEI_1" value={formData.IMEI_1} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="IMEI 2"><input name="IMEI_2" value={formData.IMEI_2} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="CORREO_SSO"><input name="CORREO_SSO" value={formData.CORREO_SSO} onChange={handleChange} className="form-input" /></FormGroup>
            <FormGroup label="ETIQ"><input name="ETIQ" value={formData.ETIQ} onChange={handleChange} className="form-input" /></FormGroup>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-slate-500">
                <Info size={24} className="text-blue-600" />
                <p className="text-xs font-bold uppercase tracking-tight italic">Los cambios se sincronizarán automáticamente.</p>
            </div>
            <button type="submit" className="w-full md:w-auto px-16 py-4 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-2xl transition-all uppercase text-xs active:scale-95">Guardar</button>
        </div>
      </form>

      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        /* ESTILOS FORZADOS PARA INPUTS DE ALTO CONTRASTE */
        .form-input { 
          width: 100%; 
          background-color: #f8fafc !important; 
          color: #0f172a !important; 
          border: 1px solid #cbd5e1 !important; 
          border-radius: 0.75rem; 
          padding: 0.65rem 1rem; 
          font-size: 0.8rem; 
          font-weight: 600; 
          outline: none; 
          transition: all 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }
        
        .form-input:focus { 
          border-color: #2563eb !important; 
          background-color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        /* Icono personalizado para selects */
        select.form-input {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1em 1em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="px-1 text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">{label}</label>
    {children}
  </div>
);

export default InventoryForm;
