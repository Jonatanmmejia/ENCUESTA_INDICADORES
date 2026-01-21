import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Copy, Check, AlertCircle } from 'lucide-react';

const AdminImporter = () => {
    const [jsonOutput, setJsonOutput] = useState(null);
    const [copied, setCopied] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            processData(data);
        };
        reader.readAsBinaryString(file);
    };

    const processData = (rows) => {
        if (rows.length < 2) return;

        const headers = rows[0];
        const content = rows.slice(1);

        // 1. DYNAMIC HEADER MAPPING
        // Instead of assuming continuous columns, we find WHERE each header is.
        // We assume Roles start AFTER the 4th column (Index 4+), or we can just pick headers that are not standard.

        // Configurable standard columns (Adjust these indices if your Area/Cat are elsewhere!)
        // Based on user feedback:
        // A(0): Pregunta ?? Wait, verify user mapping.
        // User image 2 shows: A=Pregunta, D=Tipo. 
        // BUT User request 1 said: Area, Category, Pregunta, Tipo...
        // To be safe, let's stick to the "standard" A=Area, B=Category, C=Pregunta assumption 
        // BUT accommodate the empty column E user mentioned.

        const roleColumns = [];
        headers.forEach((h, index) => {
            if (index < 4) return; // Skip A,B,C,D (Standard columns)
            if (!h || String(h).trim() === '') return; // Skip empty columns (Like Col E!)

            roleColumns.push({
                name: String(h).trim(),
                index: index // KEEP THE ORIGINAL INDEX
            });
        });

        setDebugInfo({
            detectedRoles: roleColumns.map(r => r.name),
            roleCount: roleColumns.length,
            colE_Status: headers[4] ? "Tiene Texto" : "VACÍA (Ignorada correctamente)"
        });

        const questions = content.map((row, idx) => {
            // Skip rows with no text
            if (!row[2] && !row[0]) return null;

            const area = row[0] || "General";
            const category = row[1] || "General";
            const text = row[2] || "Pregunta sin texto";
            const type = row[3] || "DF";

            const applicableRoles = [];
            roleColumns.forEach((roleCol) => {
                // USE THE SAVED INDEX to find the value
                const cellValue = row[roleCol.index];

                // Strict Check
                const valStr = String(cellValue || '').trim().toLowerCase();
                if (valStr === 'x') {
                    applicableRoles.push(roleCol.name);
                }
            });

            // Only add if at least 1 role?? Or allow orphans? Allow all.
            return {
                id: String(idx + 1000),
                area: area.trim(),
                category: category.trim(),
                text: text.trim(),
                type: type.trim(),
                applicableRoles
            };
        }).filter(q => q !== null);

        // Unique Lists
        const uniqueAreas = [...new Set(questions.map(q => q.area))].sort();
        const uniqueCategories = [...new Set(questions.map(q => q.category))].sort();
        const uniqueRoles = roleColumns.map(r => r.name);

        const outputString = `
export const ROLES = ${JSON.stringify(uniqueRoles, null, 4)};

export const AREAS = ${JSON.stringify(uniqueAreas, null, 4)};

export const CATEGORIES = ${JSON.stringify(uniqueCategories, null, 4)};

export const QUESTIONS = ${JSON.stringify(questions, null, 4)};
    `;

        setJsonOutput(outputString);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(jsonOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Generador de Datos (v3 Corregido)</h2>
                <p className="text-slate-400">Ahora ignora columnas vacías automáticamente. Sube tu Excel.</p>
            </div>

            <div className="glass p-8 rounded-xl flex flex-col items-center justify-center border-dashed border-2 border-slate-600 hover:border-primary/50 transition-all cursor-pointer relative group">
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload size={48} className="text-slate-400 group-hover:text-primary mb-4 transition-colors" />
                <p className="text-lg font-medium text-slate-300">Subir y Reparar</p>
            </div>

            {debugInfo && (
                <div className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-white mb-2">Diagnóstico:</h4>
                        <p>Columna E: <span className={debugInfo.colE_Status.includes("VACÍA") ? "text-green-400" : "text-yellow-400"}>{debugInfo.colE_Status}</span></p>
                        <p>Roles Detectados: {debugInfo.roleCount}</p>
                    </div>
                    <div className="max-h-24 overflow-y-auto">
                        <p className="text-xs text-slate-500">Roles:</p>
                        {debugInfo.detectedRoles.map(r => (
                            <span key={r} className="inline-block px-2 py-1 m-1 bg-slate-700 rounded text-xs">{r}</span>
                        ))}
                    </div>
                </div>
            )}

            {jsonOutput && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center text-slate-300">
                        <span className="font-semibold text-green-400">Datos Listos</span>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                        >
                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            <span>{copied ? 'Copiado' : 'Copiar'}</span>
                        </button>
                    </div>

                    <div className="glass p-4 rounded-xl max-h-[300px] overflow-y-auto">
                        <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap">
                            {jsonOutput}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminImporter;
