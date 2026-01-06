import Navbar from "../../components/Navbar";
import heroImg from './images/hero.jpg';
import Img from "./ClientComponents/img";
import burma from './images/burrmashina.jpg';
import computer from './images/Computer.jpg';
import elektriciann from './images/elektrician.jpg';
import hidraulik from './images/hidra.jpg';
import shtepiaku from './images/shtepiak.jpg';
import dado from './images/dadoja.jpg'

export default function Home() {
    return (
        <>  
            <div className="hero-section-container">
                <img src={heroImg} alt="workshop image" className="hero-section-img"/>
             <div className="hero-section">
                    <h1><span className="fiks">Fiks</span> c'ka te duhet</h1>
                    <p>Gjej profesionistët më të mirë për riparime dhe mbështetje IT në Kosovë.
                         Shpejt, lehtë dhe me cilësi të garantuar.</p>
                    <div className="search-bar">
                        <input type="text" placeholder="Search..." />
                        <button>Search</button>
                    </div>
                </div>
            </div>
            <div className="sherbimet-section">
                <h1>Sherbimet Tona</h1>
                <p>Zgjidhje profesionale per cdo nevoje qe mund te keni...</p>
                <div className="sherbimet-img-wrapper">
                   <Img classNaming="sherbimet-img" imgSource={burma} description="Riparime te pergjithshme"/>
                    <Img classNaming="sherbimet-img" imgSource={computer} description="IT Support"/>
                    <Img classNaming="sherbimet-img" imgSource={elektriciann} description="Electrician"/>
                    <Img classNaming="sherbimet-img" imgSource={hidraulik} description="Hidraulik"/>
                    <Img classNaming="sherbimet-img" imgSource={shtepiaku} description="Mirembajtje shtepiake"/>
                    <Img classNaming="sherbimet-img" imgSource={dado} description="Perkujdesje/Dado"/>
                </div>
            </div>
            
        </>
    )
}
