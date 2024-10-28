import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const NavBar = () => {
  const Links = [
    { id: 1, name: "Home", link: "/" },
    { id: 2, name: "Services", link: "/" },
    { id: 3, name: "About", link: "/" },
    { id: 4, name: "Contact", link: "/" },
  ];

  const [isOpen, setIsOpen] = useState(false);

  const classNames = twMerge(
    "transition-all duration-500 ease-in-out overflow-hidden",
    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
    "md:max-h-full md:opacity-100 md:block"
  );

  return (
    <div className="shadow-md w-full">
      <div className="md:flex justify-between items-center text-black py-4 px-8 md:px-10 bg-white drop-shadow-md">
        <img
          src={logo}
          alt=""
          className="w-52 hover:scale-105 transition-all ms-10 relative z-10"
        />

        {/* Menu Icon */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden"
        >
          {isOpen ? <X /> : <Menu />}
        </div>

        <ul
          className={`md:flex md:items-center font-semibold text-base me-5 md:pb-0 md:static bg-white md:z-auto z-1 w-full md:w-auto ${classNames}`}
        >
          {Links.map((link) => (
            <li
              key={link.id}
              className="p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"
            >
              <a href="/">{link.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
