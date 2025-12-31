import fiksLogo from '../assets/images/fiks.png'
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <>
        <footer className="bg-[#e6e6e6] pt-8 pb-10 shadow-lg">
            <div className="mx-auto w-full md:w-3/4 rounded-xl px-6 md:px-0">
                <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="text-center md:text-left">
                        <img className="w-48 md:w-60 mx-auto md:mx-0" src={fiksLogo} alt="fiks-logo" />
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="mb-4 font-bold text-[#444444]">Navigacion</h1>
                        <div className="flex flex-col gap-2">
                            <Link to="/" className="footer-section">Home</Link>
                            <Link to="/sherbimet" className="footer-section">Sherbimet Tona</Link>
                            <Link to="/rreth-nesh" className="footer-section">Rreth Nesh</Link>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="mb-4 font-bold text-[#444444]">Kontakt</h1>
                        <div className="flex flex-col gap-2">
                            <a href="mailto:support@fiks.com" className="footer-section">Email: support@fiks.com</a>
                            <a href="tel:+38344123456" className="footer-section">Phone: (+383) 44 123 456</a>
                            <p className="footer-section">Address: 1234 fix, Prishtine, Kosove</p>
                        </div>
                    </div>

                </div>

                <h1 className="text-[#C00F0C] font-bold text-center mt-6">© 2025 Fiks. Të gjitha të drejtat e rezervuara.</h1>
            </div>
        </footer>

        </>
    )
}