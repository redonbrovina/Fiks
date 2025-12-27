import fiksLogo from '../assets/images/fiks.png'
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
            <div className="">
                <div className="">
                    <Link to="/"><img className="w-36" src={fiksLogo} alt="Fiks Logo" /></Link>
                    <NavLink to="/sherbimet" className="">Sherbimet Tona</NavLink>
                    <NavLink to="/about" className="">Rreth Nesh</NavLink>
                </div>
                <div className="">
                    <NavLink to="/login"><button className="">Hyr</button></NavLink>
                    <NavLink to="/signup"><button className="">Regjistrohu</button></NavLink>
                </div>
                <div className="">
                    <button className="" onClick={handleClick}>
                        <img src={menuIcon} alt="menu-btn" className="w-8 h-8"/>
                    </button>
                </div>
            </div>
            <div className="">
                <NavLink to="/sherbimet" className="">Sherbimet Tona</NavLink> 
                <NavLink to="/about" className="">Rreth Nesh</NavLink>
                <NavLink to="/login"><button className="">Hyr</button></NavLink>
                <NavLink to="/signup"><button className="">Regjistrohu</button></NavLink>
            </div>
        </>
    )
}