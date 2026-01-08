import fiksLogo from '../assets/images/fiks-dark.png'
import menuIcon from '../assets/images/icons8-menu-50.png'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false)

    const handleClick = () => {
        setMenuOpen(!menuOpen);
    }

    return (
        <>
            <div className="bg-[#4a4a4a] flex justify-center md:justify-center py-2 z-30 shadow-lg">
                <div className="flex flex-row items-center justify-evenly md:w-1/4 sm:w-1/2">
                    <Link to="/"><img className="w-36" src={fiksLogo} alt="Fiks Logo" /></Link>
                </div>
                <div className="flex flex-row items-center justify-evenly md:w-1/3">
                    <NavLink to="/sherbimet" className="nav-section">Sherbimet Tona</NavLink>
                    <NavLink to="/rreth-nesh" className="nav-section">Rreth Nesh</NavLink>
                    <NavLink to="/" className="nav-section">Home</NavLink>
                </div>
                <div className="flex flex-row items-center justify-evenly md:w-1/3">
                    <NavLink to="/login"><button className="btn-style-light">Hyr</button></NavLink>
                    <NavLink to="/signup"><button className="btn-style-dark">Regjistrohu</button></NavLink>
                </div>
                <div className="md:hidden flex items-center">
                    <button className="md:hidden lg:hidden text-[#808080] hover:text-[#4a4a4a] cursor-pointer" onClick={handleClick}>
                        <img src={menuIcon} alt="menu-btn" className="w-8 h-8" />
                    </button>
                </div>
            </div>
            <div className={`sm:hidden ${menuOpen ? "flex" : "hidden"} 
                                w-full pt-20 z-20 bg-white justify-center flex-row items-center gap-4 fixed shadow-lg`}>
                <NavLink to="/sherbimet" className="nav-mobile-section">Sherbimet Tona</NavLink>
                <NavLink to="/about" className="nav-mobile-section">Rreth Nesh</NavLink>
                <NavLink to="/login"><button className="btn-style-light">Hyr</button></NavLink>
                <NavLink to="/signup"><button className="btn-style-dark">Regjistrohu</button></NavLink>
            </div>
        </>
    )
}