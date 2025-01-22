import { useRef, useState } from "react";
import Home from "./components/Home";
import WhoWeAre from "./components/WhoWeAre";
import WhyUs from "./components/WhyUs";
import Contact from "./components/Contact";
import NavBar from "./components/NavBar";

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
      <Home id="home" ref={homeRef} />
      <WhoWeAre id="whoWeAre" ref={whoWeAreRef} />
      <WhyUs id="whyUs" ref={whyUsRef} />
      <Contact id="contact" ref={contactRef} />
    </div>
  );
}

export default App3;
