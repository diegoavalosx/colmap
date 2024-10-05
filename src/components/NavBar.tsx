import { useState } from 'react';
import logo from '../assets/image.png'
// import { Link } from 'react-router-dom'

const NavBar = () => {
    

    return (
        <div className="w-full h-full absolute bg-lime-200">
            <header className="flex justify-between items-center text-black py-6 px-8md:px-32 bg-white drop-shadow-md ">
                <a href="#">
                <img src={logo} alt="" className="w-52 hover:scale-105 transition-all"></img>
                </a>

                <ul className="hidden xl:flex items-center gap-12 font-semibold text-base me-5" >
                    <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer">Home</li>
                    <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer">Products</li>
                    <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer">About</li>
                    <li className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer">Conact</li>
                </ul>

            </header>
            <div>

            </div>

    </div>
    );
  };
  
  export default NavBar;
  