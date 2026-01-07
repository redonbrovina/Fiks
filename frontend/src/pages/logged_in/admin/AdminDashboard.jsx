export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Përshendetje, Admin!</h1>
                    <p className="text-white font-medium text-center">Mirësevini në panelin e administrimit.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Quick Stats */}
                <div className="bg-[#3a3a3a] rounded-[2.5rem] p-8 shadow-lg border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6">Statistika</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#2d2d2d] rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold text-[#C00F0C]">24</p>
                            <p className="text-xs text-white/40 font-medium">Përdorues</p>
                        </div>
                        <div className="bg-[#2d2d2d] rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold text-[#C00F0C]">12</p>
                            <p className="text-xs text-white/40 font-medium">Profesionistë</p>
                        </div>
                        <div className="bg-[#2d2d2d] rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold text-[#C00F0C]">8</p>
                            <p className="text-xs text-white/40 font-medium">Rezervime Aktive</p>
                        </div>
                        <div className="bg-[#2d2d2d] rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold text-[#C00F0C]">5</p>
                            <p className="text-xs text-white/40 font-medium">Në Pritje</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
