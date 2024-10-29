import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";
import { useState } from "react";


type NavBarProps ={
  refs: {
    homeRef: React.RefObject<HTMLDivElement>;
    whoWeAreRef: React.RefObject<HTMLDivElement>;
    whyUsRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  }
}

const NavBar: React.FC<NavBarProps> = ({ refs}) => {
  
  const links = [
    { id: 1, name: "Home", ref: refs.homeRef },
    { id: 2, name: "Who we are", ref: refs.whoWeAreRef},
    { id: 3, name: "Why us", ref: refs.whyUsRef},
    { id: 4, name: "Contact", ref: refs.contactRef },
  ];
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () =>{
    setIsOpen(!isOpen);
  };

  return (
    <div className="shadow-md w-full">
      <div className="md:flex justify-between items-center text-black py-4 px-8 md:px-10 bg-white drop-shadow-md">
        <img
          src={logo}
          alt=""
          className="w-52 hover:scale-105 transition-all ms-10 relative z-10"
        />

        <button
          onClick={toggleMenu}
          className="w-7 h-7 absolute right-8 top-6 cursor-pointer md:hidden"
          type="button"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
        <ul
          className={`md:flex md:items-center font-semibold text-base me-5 md:pb-0 md:static bg-white md:z-auto z-1 w-full md:w-auto ${isOpen ? 'block' : 'hidden'} md:block`}
        >
          {links.map((link) => (
            <button
              key={link.id}
              className="p-3 font-bold hover:bg-black hover:text-white rounded-md transition-all cursor-pointer"
              onClick={ () =>{
                link.ref.current?.scrollIntoView({
                  behavior: 'smooth'
                })
              }}
            >
              
                {link.name}
              
            </button>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
