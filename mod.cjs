const fs = require('fs');
const file = 'resources/js/Pages/Pets/Show.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state and form
const search1 = "const [timelineFilter, setTimelineFilter] = useState('all');";
const replace1 = `const [timelineFilter, setTimelineFilter] = useState('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);

    const { data: docData, setData: setDocData, post: postDoc, processing: docProcessing, reset: resetDoc, errors: docErrors } = useForm({
        pet_id: pet.id,
        name: '',
        document: null,
    });

    const submitDocument = (e) => {
        e.preventDefault();
        postDoc(route('pet-documents.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDocumentModal(false);
                resetDoc();
            }
        });
    };

    const deleteDocument = (id) => {
        if (confirm('¿Eliminar este documento permanentemente?')) {
            router.delete(route('pet-documents.destroy', id), { preserveScroll: true });
        }
    };`;
content = content.replace(search1, replace1);

// 2. Update upload button
const search2 = `<button className="text-[10px] flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 p-2 rounded transition font-bold" title="Subir Documento (PDF/Imagen)">`;
const replace2 = `<button onClick={() => setShowDocumentModal(true)} type="button" className="text-[10px] flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-400 p-2 rounded transition font-bold" title="Subir Documento (PDF/Imagen)">`;
content = content.replace(search2, replace2);

// 3. Render documents
const search3 = `{pet.consents?.length > 0 ? (
                                        <ul className="divide-y dark:divide-gray-700">`;
const replace3 = `{(pet.consents?.length > 0 || pet.documents?.length > 0) ? (
                                        <ul className="divide-y dark:divide-gray-700">
                                            {pet.documents?.map(doc => (
                                                <li key={'doc-'+doc.id} className="py-3 flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">📎</span>
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{doc.name}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">SUBIDO EL {new Date(doc.created_at).toLocaleDateString()} • {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <a
                                                            href={route('pet-documents.download', doc.id)}
                                                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition"
                                                            title="Descargar Documento"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        </a>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); deleteDocument(doc.id); }}
                                                            className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}`;
content = content.replace(search3, replace3);

const search4 = `<p className="text-gray-500 text-center py-4 text-sm italic">No hay documentos firmados aún.</p>`;
const replace4 = `<p className="text-gray-500 text-center py-4 text-sm italic">No hay documentos adjuntos ni firmados aún.</p>`;
content = content.replace(search4, replace4);

// 4. Modal definition
const search5 = `</AuthenticatedLayout>`;
const replace5 = `                {showDocumentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                    <h3 className="font-black uppercase tracking-tight text-lg text-gray-900 dark:text-gray-100">Bandeja Flotante</h3>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Adjuntar documento a {pet.name}</p>
                                </div>
                                <button onClick={() => setShowDocumentModal(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <form onSubmit={submitDocument} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-1 shadow-sm">Nombre / Título del Archivo</label>
                                    <input
                                        type="text"
                                        value={docData.name}
                                        onChange={e => setDocData('name', e.target.value)}
                                        placeholder="Ej. Resultados Hemograma, Placa Torax..."
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 shadow-sm text-sm"
                                        required
                                    />
                                    {docErrors.name && <p className="text-red-500 text-xs mt-1">{docErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 tracking-widest mb-1">Archivo (PDF / Imágenes)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-900/30">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                    <span>{!docData.document ? 'Selecciona un archivo' : docData.document.name}</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={e => setDocData('document', e.target.files[0])} required />
                                                </label>
                                            </div>
                                            {!docData.document && <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">PNG, JPG, PDF hasta 10MB</p>}
                                        </div>
                                    </div>
                                    {docErrors.document && <p className="text-red-500 text-xs mt-1">{docErrors.document}</p>}
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDocumentModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={docProcessing || !docData.document}
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {docProcessing ? 'Subiendo...' : 'Subir y Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
</AuthenticatedLayout>`;
content = content.replace(search5, replace5);

fs.writeFileSync(file, content, 'utf8');
console.log('Done!');
