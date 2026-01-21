import React, { useState, useMemo } from 'react';
import { ROLES, AREAS, QUESTIONS } from '../data/mockData';
import QuestionCard from './QuestionCard';
import AdminImporter from './AdminImporter';
import { Filter, Search, Settings, Send, AlertTriangle, Briefcase, Layers, Check } from 'lucide-react';
import { Filter, Search, Settings, Send, AlertTriangle, Briefcase, Layers, Check } from 'lucide-react';

const SurveyForm = ({ isClientMode = false }) => {
    const [showAdmin, setShowAdmin] = useState(false);
    // Initialize role immediately if in Client Mode
    const [role, setRole] = useState(isClientMode ? 'Cliente' : '');
    // Area filter REMOVED - Area is now a grouping header
    const [responses, setResponses] = useState({});
    const [showWelcome, setShowWelcome] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    // Sync role if mode changes dynamically
    React.useEffect(() => {
        if (isClientMode) {
            setRole("Cliente");
        } else if (role === "Cliente") {
            // If switching OUT of client mode, reset role
            setRole("");
        }
    }, [isClientMode, role]); // Added role to dependency array to prevent stale closure issues if role changes internally

    // 1. Get ALL available roles that have at least one question
    const availableRoles = useMemo(() => {
        // If Client Mode -> ONLY return "Cliente"
        if (isClientMode) {
            return ["Cliente"];
        }

        const validRoles = new Set();
        QUESTIONS.forEach(q => {
            if (Array.isArray(q.applicableRoles)) {
                q.applicableRoles.forEach(r => validRoles.add(r));
            }
        });

        // In Normal Mode, REMOVE "Cliente" so internal candidates don't see it
        validRoles.delete("Cliente");

        return [...validRoles].sort();
    }, [isClientMode]);

    // 2. Filter Questions based ONLY on Role
    const questionsByRole = useMemo(() => {
        if (!role) return [];
        return QUESTIONS.filter(q => q.applicableRoles.includes(role));
    }, [role]);

    // 3. Group Questions by AREA -> CATEGORY
    const groupedData = useMemo(() => {
        const groups = {}; // { "AreaName": { "CategoryName": [questions...] } }

        questionsByRole.forEach(q => {
            if (!groups[q.area]) {
                groups[q.area] = {};
            }
            if (!groups[q.area][q.category]) {
                groups[q.area][q.category] = [];
            }
            groups[q.area][q.category].push(q);
        });
        return groups;
    }, [questionsByRole]);

    const handleResponseChange = (questionId, typeCode) => {
        setResponses(prev => {
            const current = prev[questionId] || [];
            const isSelected = current.includes(typeCode);

            if (isSelected) {
                return { ...prev, [questionId]: [] };
            } else {
                return { ...prev, [questionId]: [typeCode] };
            }
        });
    };

    const handleSubmit = () => {
        // Enrich the data: Map ID -> Full Question Details
        const richData = Object.entries(responses).map(([qId, answerList]) => {
            const code = answerList[0]; // 'F' or 'D'
            const question = QUESTIONS.find(q => q.id === qId);

            return {
                fecha: new Date().toLocaleString(), // Local readable time for Excel
                rol: role,
                area: question?.area || "Desconocida",
                categoria: question?.category || "Desconocida",
                pregunta: question?.text || "Texto no encontrado",
                respuesta: code === 'F' ? "Fortaleza" : (code === 'D' ? "Debilidad" : code)
            };
        });

        // Debug: Log to see what we are sending
        console.log("Datos a enviar:", richData);

        // Google Sheets Integration (LIVE)
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxEBcK45-SbOCraGhBphGlXXxdcwvnHmp8shfOipLnlXUwSSkvIh9veDcMM56C0XNd2/exec";

        fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // Required for Google Apps Script
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(richData)
        })
            .then(() => {
                console.log("Enviado a Google Sheets");
            })
            .catch(err => console.error("Error enviando a Google Sheets", err));

        // Show Success Screen immediately (don't wait for fetch since no-cors is opaque)
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="glass max-w-lg p-12 rounded-3xl text-center space-y-8 border-t-4 border-green-500 shadow-2xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="flex justify-center relative">
                        <div className="p-6 bg-green-500/10 rounded-full text-green-400 ring-4 ring-green-500/20 animate-bounce-slow">
                            <Check size={64} strokeWidth={3} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">
                            ¡Respuestas Enviadas!
                        </h2>
                        <p className="text-slate-300 text-lg">
                            Gracias por su tiempo y apoyo. <br />
                            Sus respuestas han sido registradas exitosamente.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="text-slate-500 hover:text-white text-sm underline underline-offset-4 transition-colors"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showWelcome) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="glass max-w-lg p-8 rounded-2xl text-center space-y-6 border-l-4 border-yellow-500">
                    <div className="flex justify-center">
                        <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500">
                            <AlertTriangle size={48} />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white">Antes de comenzar</h2>

                    <p className="text-slate-300 text-lg leading-relaxed">
                        Para garantizar la calidad de los datos, le solicitamos atentamente:
                    </p>

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="text-yellow-200 font-medium">
                            "Si no cuenta con elementos suficientes para soportar su respuesta, por favor absténgase de responder."
                        </p>
                    </div>

                    <p className="text-slate-400 text-sm">
                        Sus respuestas son anónimas y vitales para nuestra mejora continua.
                    </p>

                    <button
                        onClick={() => setShowWelcome(false)}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                    >
                        Entendido, continuar
                    </button>
                </div>
            </div>
        );
    }

    if (showAdmin) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowAdmin(false)}
                    className="absolute top-0 right-0 text-sm text-slate-500 hover:text-white"
                >
                    Volver a Encuesta
                </button>
                <AdminImporter />
            </div>
        )
    }

    const handleAdminClick = () => {
        const password = prompt("Ingrese contraseña de administrador:");
        if (password === "4862") {
            setShowAdmin(true);
        } else if (password !== null) { // Don't alert if cancelled
            alert("Acceso denegado");
        }
    };

    const hasQuestions = Object.keys(groupedData).length > 0;

    return (
        <div className="space-y-8 relative">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 drop-shadow-sm">
                    {isClientMode ? "Sección de Clientes" : "Encuesta Profesional"}
                </h1>

                {isClientMode ? (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                        <p className="text-xl text-slate-300 font-medium">Bievenido estimado cliente</p>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            Ayúdenos a mejorar nuestros servicios respondiendo las siguientes preguntas.
                        </p>
                    </div>
                ) : (
                    <p className="text-slate-400 text-lg">Seleccione su Rol para ver todas las preguntas</p>
                )}
            </div>

            {/* Filter - SHOW ONLY IF NOT CLIENT MODE */}
            {!isClientMode && (
                <div className="glass p-6 rounded-2xl max-w-lg mx-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                            <Briefcase size={14} /> Rol / Puesto
                        </label>
                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="input-field appearance-none cursor-pointer"
                            >
                                <option value="">Seleccionar Rol...</option>
                                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <Filter className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>
            )}
            {/* Results Section - Grouped by AREA -> CATEGORY */}
            <div className="space-y-8">
                {/* REMOVED 'Preguntas Totales' counter */}

                {hasQuestions ? (
                    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {Object.entries(groupedData).map(([areaName, categories]) => (
                            <div key={areaName} className="space-y-8">

                                {/* AREA HEADER (Big & Prominent) */}
                                <div className="text-center border-b-2 border-slate-700 pb-4 mb-8">
                                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                                        {areaName}
                                    </h2>
                                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-violet-500 mx-auto mt-4 rounded-full"></div>
                                </div>

                                {/* CATEGORIES within Area */}
                                {Object.entries(categories).map(([catName, questions]) => (
                                    <div key={catName} className="space-y-4">

                                        {/* CATEGORY HEADER (The stylized one, no interactive) */}
                                        <div className="flex items-center space-x-4 py-6">
                                            <div className="h-px bg-slate-800 flex-1"></div>
                                            <span className="px-4 py-1 rounded-full border border-blue-500/30 text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] uppercase tracking-[0.2em]">
                                                {catName}
                                            </span>
                                            <div className="h-px bg-slate-800 flex-1"></div>
                                        </div>

                                        {/* Questions Grid */}
                                        <div className="space-y-4">
                                            {questions.map(q => (
                                                <QuestionCard
                                                    key={q.id}
                                                    question={q}
                                                    responses={responses}
                                                    onResponseChange={handleResponseChange}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* SUBMIT BUTTON */}
                        <div className="flex justify-center pt-8 pb-12">
                            <button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold py-4 px-12 rounded-full shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all flex items-center space-x-3"
                            >
                                <span>Enviar Todas las Respuestas</span>
                                <Send size={20} />
                            </button>
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-600">
                        {role ? (
                            // Should be rare if we filtered roles correctly
                            <p className="text-orange-400">Este Rol no tiene preguntas asignadas.</p>
                        ) : (
                            <p>Seleccione su Rol para comenzar.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Admin - HIDDEN TEXT & PROTECTED */}
            <div className="flex justify-center mt-20 opacity-5 hover:opacity-100 transition-opacity duration-700">
                <button
                    onClick={handleAdminClick}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Configuración"
                >
                    <Settings size={14} />
                </button>
            </div>
        </div>
    );
};

export default SurveyForm;
