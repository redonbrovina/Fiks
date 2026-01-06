export default function ClientDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#444444]">Përshendetje, Perdorues!</h1>
                    <p className="text-[#444444]/60 font-medium">Mirësevini në panelin tuaj të kontrollit.</p>
                </div>
                <button className="px-6 py-3 bg-[#C00F0C] text-white font-bold rounded-2xl shadow-xl shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    Rezervo një Shërbim
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white">
                    <h2 className="text-xl font-bold text-[#444444] mb-6">Aktivitetet e Fundit</h2>
                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="w-2 h-2 mt-2 rounded-full bg-[#C00F0C]"></div>
                                <div>
                                    <p className="text-sm font-bold text-[#444444]">Kërkesë për Pastrim Shtëpie</p>
                                    <p className="text-xs text-[#444444]/40 font-medium">Sot, ora 14:30 • Prishtinë</p>
                                </div>
                                <span className="ml-auto px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">Në Proces</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
