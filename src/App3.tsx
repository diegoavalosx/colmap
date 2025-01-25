import { forwardRef, useRef, useState } from "react";
import WhoWeAre from "./components/WhoWeAre";
import WhyUs from "./components/WhyUs";
import Contact from "./components/Contact";
import NavBar from "./components/NavBar";
import image from "./assets/carousel-images/2.png";

function App3() {
  const homeRef = useRef<HTMLDivElement>(null);
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState<string>("home");

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);

    const refMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
      home: homeRef,
      whoWeAre: whoWeAreRef,
      whyUs: whyUsRef,
      contact: contactRef,
    };

    const sectionRef = refMap[sectionId];
    if (sectionRef?.current) {
      const offsetPosition = sectionRef.current.offsetTop;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="h-screen bg-deluxe-black text-deluxe-black font-sans">
      <NavBar
        scrollToSection={scrollToSection}
        activeSection={currentSection}
      />
      <HomeDummy id="home" ref={homeRef} />
      <WhoWeAre id="whoWeAre" ref={whoWeAreRef} />
      <WhyUs id="whyUs" ref={whyUsRef} />
      <Contact id="contact" ref={contactRef} />
    </div>
  );
}

interface HomeDummyProps {
  id?: string;
}

const HomeDummy = forwardRef<HTMLDivElement, HomeDummyProps>(({ id }, ref) => {
  return (
    <div
      id={id}
      ref={ref}
      className="h-screen w-full bg-deluxe-gray overflow-hidden animate-fadeIn"
    >
      <img src={image} alt="homepage" className="object-cover h-full w-full" />
    </div>
  );
});

export default App3;
