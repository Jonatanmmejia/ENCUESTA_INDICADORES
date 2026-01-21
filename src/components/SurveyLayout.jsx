import React from 'react';

const SurveyLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 relative overflow-hidden">
            {/* Abstract Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />

            <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {children}
            </main>
        </div>
    );
};

export default SurveyLayout;
