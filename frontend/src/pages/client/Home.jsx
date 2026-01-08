import Navbar from "../../components/Navbar";
import heroImg from './images/hero.jpg';
import Img from "./clientComponents/Img";
import burma from './images/burrmashina.jpg';
import computer from './images/Computer.jpg';
import elektriciann from './images/elektrician.jpg';
import hidraulik from './images/hidra.jpg';
import shtepiaku from './images/shtepiak.jpg';
import dado from './images/dadoja.jpg'
import TestimonialCard from './clientComponents/TestimonialCard.jsx';

export default function Home() {


    const text_map = {
        "1. Kerko Sherbimin": "Përshkruaj problemin ose shërbimin që të duhet dhe gjej profesionistët e duhur.",
        "2. Shiko Profilet": "Shfleto profilat e profesionistëve, lexoni vlerësimet dhe zgjidhni atë që i përshtatet nevojave tuaja.",
        "3. Rezervo Online": "Përdorni platformën tonë për të rezervuar shërbimin në një kohë që ju përshtatet.",
        "4. Pune e kryer": "Pas përfundimit të shërbimit, lini një vlerësim për të ndihmuar të tjerët në zgjedhjen e tyre."
    }

    const reviews = [
        { quote: "Fantastik! Jeni me te miret!", author: "Faton Gashi" },
        { quote: "Fiks me ka shpetuar jeten!", author: "Pranvera Misini" },
        { quote: "Wow! Jeni te pabesueshem!", author: "Azem Jaha" },
        { quote: "Fiks cka kam kerkuar!", author: "Faton Gashi" },
    ];

    return (
        <>
            <div className="hero-section-container">
                <img src={heroImg} alt="workshop image" className="hero-section-img" />
                <div className="hero-section">
                    <h1><span className="fiks">Fiks</span> c'ka te duhet</h1>
                    <p>Gjej profesionistët më të mirë për riparime dhe mbështetje IT në Kosovë.
                        Shpejt, lehtë dhe me cilësi të garantuar.</p>
                </div>
            </div>
            <div className="sherbimet-section">
                <h1>Sherbimet Tona</h1>
                <p>Zgjidhje profesionale per cdo nevoje qe mund te keni...</p>
                <div className="sherbimet-img-wrapper">
                    <Img classNaming="sherbimet-img" imgSource={burma} description="Riparime te pergjithshme" />
                    <Img classNaming="sherbimet-img" imgSource={computer} description="IT Support" />
                    <Img classNaming="sherbimet-img" imgSource={elektriciann} description="Electrician" />
                    <Img classNaming="sherbimet-img" imgSource={hidraulik} description="Hidraulik" />
                    <Img classNaming="sherbimet-img" imgSource={shtepiaku} description="Mirembajtje shtepiake" />
                    <Img classNaming="sherbimet-img" imgSource={dado} description="Perkujdesje/Dado" />
                </div>
            </div>
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
            <section className="px-[10%] py-16 bg-white">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold">Cfare thone klientet tane?</h2>
                    <p className="text-gray-400">Mijera kliente te kenaqur ne tere Kosoven</p>
                </div>

                {/* 2. The Gray Grid Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-8 bg-gray-200 rounded-md">
                    {reviews.map((review, index) => (
                        <TestimonialCard
                            key={index}
                            quote={review.quote}
                            author={review.author}
                            image={review.image} // Optional: add image paths to the array later
                        />
                    ))}
                </div>
            </section>
        </>
    )
}
