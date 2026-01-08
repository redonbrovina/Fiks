
import { useNavigate } from 'react-router-dom';
import perdoruesi from './images/perdoruesi.jpg';
import profesionisti from './images/profesionisti.jpg';

export default function Sherbimet() {
    const navigate = useNavigate();

    const text_map = {
        "1. Kerko Sherbimin": "Përshkruaj problemin ose shërbimin që të duhet dhe gjej profesionistët e duhur.",
        "2. Shiko Profilet": "Shfleto profilat e profesionistëve, lexoni vlerësimet dhe zgjidhni atë që i përshtatet nevojave tuaja.",
        "3. Rezervo Online": "Përdorni platformën tonë për të rezervuar shërbimin në një kohë që ju përshtatet.",
        "4. Pune e kryer": "Pas përfundimit të shërbimit, lini një vlerësim për të ndihmuar të tjerët në zgjedhjen e tyre."
    }

    return (
        <>
            <header className="bg-[#6b6b6b] py-30">
                <div className="max-w-[1200px] mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold leading-[1.2] text-white mb-8">Sherbimet Tona</h1>

                    <div className="grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-8 md:w-3/4 md:mx-auto">
                        <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                            <div className="w-full h-44 bg-[#D9D9D9] rounded flex items-center justify-center mb-4">
                                <img src={perdoruesi} alt="Perdoruesi" className="w-full h-full object-cover rounded" />
                            </div>
                            <p className="font-semibold">Perdoruesi</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                            <div className="w-full h-44 bg-[#D9D9D9] rounded flex items-center justify-center mb-4">
                                <img src={profesionisti} alt="Profesionistet" className="w-full h-full object-cover rounded" />
                            </div>
                            <p className="font-semibold">Profesionistet</p>
                        </div>
                    </div>
                </div>
            </header>
            <section className="bg-[#333333] py-16">
                <div className="max-w-[1200px] mx-auto px-4">
                    <h1 className="text-3xl font-bold text-white pb-6">Disa klikime nga zgjidhja</h1>
                    <div className="grid grid-cols-4 md:grid-cols-3 gap-6 mb-6 py-6">
                        {Object.keys(text_map).map((i) => (
                            <div key={i} className="bg-white rounded-lg p-6 flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#C00F0C] flex items-center justify-center text-white font-bold">{i.split('.')[0]}</div>
                                    <h3 className="font-semibold">{i.split('.')[1]}</h3>
                                </div>
                                <p className="text-sm text-gray-700">{text_map[i]}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button className="bg-[#222] text-white px-6 py-3 rounded-md">Më shumë shërbime</button>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="max-w-[1200px] mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">Perdoruesi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-8 items-start">
                        <div className="relative">
                            <div className="w-full h-48 bg-[#D9D9D9] rounded-lg flex items-center justify-center">
                                <img src={perdoruesi} alt="Perdoruesi" className="w-full h-full object-cover rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <p className="text-base leading-7 text-[#000000]">"Gjeni ekspertin e duhur për çdo nevojë të shtëpisë ose biznesit tuaj. Nga riparimet elektrike dhe hidraulike deri te shërbimet e kujdesit personal, platforma jonë ju lidh me profesionistë të verifikuar në kohë reale. Thjesht zgjidhni shërbimin, krahasoni vlerësimet dhe rezervoni me një klik."</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#2f2f2f] py-20">
                <div className="max-w-[1200px] mx-auto px-4 text-white">
                    <h2 className="text-3xl font-bold mb-6">Profesionisti</h2>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-8 items-start">
                        <div>
                            <p className="text-base leading-7">"Vini aftësitë tuaja në punë dhe rritni bazën tuaj të klientëve. Duke u bërë pjesë e tregut tonë, ju fitoni akses te qindra përdorues që kërkojnë shërbimet tuaja çdo ditë. Listoni shërbimet tuaja, ndërtoni një profil besueshëm përmes vlerësimeve dhe menaxhoni kërkesat tuaja me lehtësi."</p>
                        </div>
                        <div className="w-full h-48 bg-[#D9D9D9] rounded-lg flex items-center justify-center text-[#333]">
                            <img src={profesionisti} alt="Profesionisti" className="w-full h-full object-cover rounded-lg" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-12">
                <div className="flex justify-center items-center flex-col gap-6 p-10">
                    <p className="text-3xl font-bold text-[#000000]">Jeni te interesuar?</p>
                    <button 
                        onClick={() => navigate('/signup')}
                        className="btn-style-dark w-40 font-bold hover:bg-[#a00d0a] hover:scale-105 transition-all duration-200 transform"
                    >
                        Fillo Tani
                    </button>
                </div>
            </section>
        </>
    )
}
