import { Menu, X } from "lucide-react";
import logo from "../assets/oohyeah-logo-black.png";
import { useEffect, useState } from "react";

type NavBarProps = {
  refs: {
    mainRef: React.RefObject<HTMLDivElement>;
    whoWeAreRef: React.RefObject<HTMLDivElement>;
    whyUsRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  };
};

const NavBar: React.FC<NavBarProps> = ({ refs }) => {
  const links = [
    { id: 1, name: "Home", ref: refs.mainRef },
    { id: 2, name: "Who we are", ref: refs.whoWeAreRef },
    { id: 3, name: "Why us", ref: refs.whyUsRef },
    { id: 4, name: "Contact", ref: refs.contactRef },
  ];
  const [activeLink, setActiveLink] = useState(links[0].id); // Estado de enlace activo

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY;

    for (const link of links) {
      const section = link.ref.current;
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        // Verificar si está dentro de la sección

        if (
          scrollPosition >= sectionTop - sectionHeight / 2  &&
          scrollPosition < sectionTop + sectionHeight / 2 
        ) {
          setActiveLink(link.id);
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [links]);

  return (
    <div className="fixed top-0 left-0 w-full z-10 h-20">
      <div className="md:flex justify-between items-center text-black py-4 px-8 md:px-10 bg-white h-full">
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
          className={`md:flex md:items-center font-semibold text-base md:pb-0 md:static  md:z-auto z-1 w-full md:w-auto absolute bg-white ${
            isOpen ? "block" : "hidden"
          } md:block flex top-full left-0 right-0 items-center justify-center`}
        >
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              className={`p-3 font-bold  hover:text-ooh-yeah-pink rounded-md duration-300 hover:scale-105 transition-all cursor-pointer ${
                activeLink === link.id ? "text-ooh-yeah-pink" : ""
              }`}
              onClick={() => {
                if (link.ref.current) {
                  // Get the position of the element relative to the top of the document
                  const topPosition =
                    link.ref.current.getBoundingClientRect().top +
                    window.pageYOffset;

                  // Subtract the height of the fixed navbar (e.g., 64px or the specific height of your navbar)
                  const offset = window.innerWidth >= 1024 ? 80: 100; // Adjust this value to match your navbar's height

                  // Scroll to the element with the offset
                  window.scrollTo({
                    top: topPosition - offset,
                    behavior: "smooth",
                  });
                }
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
