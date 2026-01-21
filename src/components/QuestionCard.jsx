import React from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

const TYPE_MAPPING = {
    'D': { label: 'Debilidad', icon: AlertTriangle, color: 'text-red-400' },
    'O': { label: 'Oportunidad', icon: TrendingUp, color: 'text-green-400' },
    'F': { label: 'Fortaleza', icon: CheckCircle, color: 'text-blue-400' },
    'A': { label: 'Amenaza', icon: ShieldAlert, color: 'text-orange-400' }
};

const QuestionCard = ({ question, responses, onResponseChange }) => {
    const types = question.type.split('').filter(t => TYPE_MAPPING[t]);

    return (
        <div className="glass p-6 rounded-xl hover:bg-slate-800/80 transition-all mb-4">
            <h3 className="text-lg font-medium text-white mb-4">{question.text}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {types.map(typeCode => {
                    const config = TYPE_MAPPING[typeCode];
                    const Icon = config.icon;
                    const isChecked = responses[question.id]?.includes(typeCode);

                    return (
                        <label
                            key={typeCode}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${isChecked
                                    ? 'bg-blue-500/20 border-blue-500/50'
                                    : 'bg-slate-900/40 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={!!isChecked}
                                onChange={() => onResponseChange(question.id, typeCode)}
                            />
                            <div className={`p-2 rounded-full bg-slate-800 ${config.color}`}>
                                <Icon size={18} />
                            </div>
                            <span className="text-slate-300 font-medium">{config.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;
