import logo from "../assets/oohyeah-logo-black.png";

interface HomeProps {
  scrollToSection: (sectionId: string) => void;
}

const Home: React.FC<HomeProps> = ({ scrollToSection }) => {
  return (
    <div className="h-full flex w-full bg-white rounded-br-custom-br justify-center items-center">
      <div className="flex flex-col items-center space-y-6 animate-fadeIn">
        <img
          src={logo}
          alt="logo"
          className="h-20 object-contain transition-transform duration-300 hover:scale-110"
        />
        <ul className="font-bold space-y-4">
          {[
            { label: "DOMINATE THE STREETS", section: "whoWeAre" },
            { label: "ABOUT US", section: "whyUs" },
            { label: "GET IN TOUCH", section: "contact" },
          ].map((item) => (
            <li
              key={item.section}
              className="text-2xl hover:text-ooh-yeah-pink transition-colors duration-200"
            >
              <button
                type="button"
                onClick={() => scrollToSection(item.section)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
