import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Img from "./clientComponents/Img";
import burma from './images/burrmashina.jpg';
import computer from './images/Computer.jpg';
import elektriciann from './images/elektrician.jpg';
import hidraulik from './images/hidra.jpg';
import shtepiaku from './images/shtepiak.jpg';
import dado from './images/dadoja.jpg';

export default function About() {
    const navigate = useNavigate();

    const features = [
        {
            icon: "🎯",
            title: "Misioni ynë",
            description: "Të ofrojmë një urë lidhëse të sigurt dhe efikase mes klientëve që kanë nevojë për shërbime dhe profesionistëve të dedikuar që ofrojnë zgjidhje cilësore."
        },
        {
            icon: "🤝",
            title: "Vlerat tona",
            description: "Besueshmëri, cilësi dhe profesionalizëm. Ne e kuptojmë se gjetja e një eksperti të besueshëm për riparime ose projekte shtëpiake mund të jetë sfiduese."
        },
        {
            icon: "🚀",
            title: "Përse të zgjidhni ne",
            description: "Platformë e lehtë për t'u përdorur, me profesionistë të verifikuar dhe një sistem vlerësimesh i transparentë."
        },
        {
            icon: "💼",
            title: "Për profesionistët",
            description: "Vini aftësitë tuaja në punë dhe rritni bazën tuaj të klientëve. Duke u bërë pjesë e tregut tonë, ju fitoni akses te qindra përdorues."
        }
    ];

    const stats = [
        { number: "500+", label: "Profesionistë të Verifikuar" },
        { number: "10,000+", label: "Klientë të Kënaqur" },
        { number: "50+", label: "Kategori Shërbimesh" },
        { number: "4.8/5", label: "Vlerësim Mesatar" }
    ];

    return (
        <>  
            <div className="hero-section-container">
                <div className="hero-section">
                    <h1><span className="fiks">Rreth</span> Nesh</h1>
                    <p>Platforma juaj e besuar për të gjetur profesionistë të kualifikuar për çdo nevojë.
                         Ne e kuptojmë se gjetja e një eksperti të besueshëm mund të jetë sfiduese.</p>
                </div>
            </div>

            <section className="bg-white py-16">
                <div className="max-w-[1200px] mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Pse të zgjidhni Fiks?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8 mb-16">
                        <h3 className="text-2xl font-bold text-center mb-8">Statistikat tona</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl font-bold text-[#C00F0C] mb-2">{stat.number}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#333333] py-16">
                <div className="max-w-[1200px] mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Si funksionon?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white rounded-lg p-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-900">Për klientët</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Kërkoni shërbimin</h4>
                                        <p className="text-gray-600">Përshkruani problemin ose shërbimin që të duhet dhe gjeni profesionistët e duhur.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Shikoni profilet</h4>
                                        <p className="text-gray-600">Shfleto profilat e profesionistëve, lexoni vlerësimet dhe zgjidhni atë që i përshtatet nevojave tuaja.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Rezervoni online</h4>
                                        <p className="text-gray-600">Përdorni platformën tonë për të rezervuar shërbimin në një kohë që ju përshtatet.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Puna e kryer</h4>
                                        <p className="text-gray-600">Pas përfundimit të shërbimit, lini një vlerësim për të ndihmuar të tjerët në zgjedhjen e tyre.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-900">Për profesionistët</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Regjistrohuni</h4>
                                        <p className="text-gray-600">Krijoni profil profesional dhe listoni shërbimet tuaja për të arritur mijëra klientë.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Merrni vlerësime</h4>
                                        <p className="text-gray-600">Ndërtoni reputacion të mirë përmes vlerësimeve pozitive nga klientët e kënaqur.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Rritni biznesin</h4>
                                        <p className="text-gray-600">Zgjidhni nga shërbimet e ndryshme dhe menaxhoni kërkesat në mënyrë efikase.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button 
                            onClick={() => navigate('/signup')}
                            className="bg-[#C00F0C] text-white px-8 py-3 rounded-lg hover:bg-[#a00d0a] transition-colors duration-200"
                        >
                            Regjistrohu si Profesionist
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white py-16">
                <div className="max-w-[1200px] mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Shërbimet tona popullore</h2>
                    <div className="sherbimet-img-wrapper">
                       <Img classNaming="sherbimet-img" imgSource={burma} description="Riparime te pergjithshme"/>
                       <Img classNaming="sherbimet-img" imgSource={computer} description="IT Support"/>
                       <Img classNaming="sherbimet-img" imgSource={elektriciann} description="Electrician"/>
                       <Img classNaming="sherbimet-img" imgSource={hidraulik} description="Hidraulik"/>
                       <Img classNaming="sherbimet-img" imgSource={shtepiaku} description="Mirembajtje shtepiake"/>
                       <Img classNaming="sherbimet-img" imgSource={dado} description="Perkujdesje/Dado"/>
                    </div>
                </div>
            </section>
        </>
    )
}
