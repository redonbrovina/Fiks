import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const [activeSection, setActiveSection] = useState('system');
    const navigate = useNavigate();
    const GRAFANA_URL = 'http://localhost:3000';
    const DASHBOARD_UID = 'fiks-overview';

    // Panel IDs - System Performance
    const systemPanels = {
        servicesUp: 1,
        cpuUsage: 3,
        uptime: 5,
        memoryUsage: 2
    };

    // Panel IDs - Business Metrics
    const businessPanels = {
        totalUsers: 10,
        professionals: 11,
        totalBookings: 12,
        avgRating: 14,
        usersOverTime: 20,
        professionalsOverTime: 21,
        bookingsOverTime: 22,
    };

    // Reusable Grafana Panel Component
    const GrafanaPanel = ({ panelId, height = "100%" }) => (
        <iframe
            src={`${GRAFANA_URL}/d-solo/${DASHBOARD_UID}?orgId=1&panelId=${panelId}&theme=dark&refresh=30s`}
            width="100%"
            height={height}
            frameBorder="0"
            loading="lazy"
            title={`Grafana Panel ${panelId}`}
        />
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Përshëndetje, Admin!</h1>
                    <p className="text-white/60 font-medium">Mirësevini në panelin e administrimit.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveSection('system')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${activeSection === 'system' ? 'bg-[#C00F0C] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                        ⚙️ Sistemi
                    </button>
                    <button
                        onClick={() => setActiveSection('business')}
                        className={`px-4 py-2 rounded-xl font-medium transition-all ${activeSection === 'business' ? 'bg-[#C00F0C] text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                    >
                        📊 Biznesi
                    </button>
                    <button
                        onClick={() => navigate('/admin/kerkesat')}
                        className="px-4 py-2 rounded-xl font-medium transition-all bg-white/10 text-white/70 hover:bg-white/20"
                    >
                        📋 Kërkesat
                    </button>
                </div>
            </div>

            {/* SYSTEM PERFORMANCE SECTION */}
            {(activeSection === 'system') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚙️</span>
                        <h2 className="text-2xl font-bold text-white">Performanca e Sistemit</h2>
                        <a
                            href={`${GRAFANA_URL}/d/${DASHBOARD_UID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs text-[#C00F0C] hover:text-[#a00c0a] transition-colors flex items-center gap-1"
                        >
                            <span>Grafana Dashboard</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>

                    {/* System Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[140px]">
                            <GrafanaPanel panelId={systemPanels.servicesUp} />
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[140px]">
                            <GrafanaPanel panelId={systemPanels.cpuUsage} />
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[140px]">
                            <GrafanaPanel panelId={systemPanels.uptime} />
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[140px]">
                            <GrafanaPanel panelId={systemPanels.memoryUsage} />
                        </div>
                    </div>
                </div>
            )}

            {/* BUSINESS METRICS SECTION */}
            {(activeSection === 'business') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <h2 className="text-2xl font-bold text-white">Metrika të Biznesit</h2>
                    </div>

                    {/* Business Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[120px]">
                            <GrafanaPanel panelId={businessPanels.totalUsers} />
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[120px]">
                            <GrafanaPanel panelId={businessPanels.professionals} />
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[120px]">
                            <GrafanaPanel panelId={businessPanels.totalBookings} />
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5 h-[120px]">
                            <GrafanaPanel panelId={businessPanels.avgRating} />
                        </div>
                    </div>

                    {/* Time Series Charts */}
                    <h3 className="text-lg font-bold text-white/80 mt-8">Trende të Kohës</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 border-b border-white/5">
                                <h4 className="text-sm font-bold text-white">👥 Përdoruesit me Kohë</h4>
                            </div>
                            <div className="h-[200px]">
                                <GrafanaPanel panelId={businessPanels.usersOverTime} />
                            </div>
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 border-b border-white/5">
                                <h4 className="text-sm font-bold text-white">🔧 Profesionistët me Kohë</h4>
                            </div>
                            <div className="h-[200px]">
                                <GrafanaPanel panelId={businessPanels.professionalsOverTime} />
                            </div>
                        </div>
                        <div className="bg-[#3a3a3a] rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 border-b border-white/5">
                                <h4 className="text-sm font-bold text-white">📅 Rezervimet me Kohë</h4>
                            </div>
                            <div className="h-[200px]">
                                <GrafanaPanel panelId={businessPanels.bookingsOverTime} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-[#3a3a3a]/50 rounded-2xl p-6 border border-white/5">
                <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm text-white/80 font-medium">
                            Metrikat përditësohen automatikisht çdo <span className="text-[#C00F0C] font-bold">30 sekonda</span>.
                        </p>
                        <p className="text-xs text-white/50 mt-2">
                            <a href="http://localhost:3000/d/fiks-overview" target="_blank" rel="noopener noreferrer" className="text-[#C00F0C] hover:underline">Grafana Dashboard</a> |
                            <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer" className="text-[#C00F0C] hover:underline ml-1">Prometheus</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
