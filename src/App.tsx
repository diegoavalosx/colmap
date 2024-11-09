import "./App.css";
import Main from "./components/Main";
import NavBar from "./components/NavBar";
import { useRef, useState, useEffect, useCallback } from "react";

function App() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("about");

  const scrollToSection = (sectionId: string) => {
    const navbarOffset = 80;
    const refMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
      about: aboutRef,
      whoAreWe: whoWeAreRef,
      whyUs: whyUsRef,
      contact: contactRef,
    };

    const sectionRef = refMap[sectionId];
    if (sectionRef?.current) {
      const offsetPosition = sectionRef.current.offsetTop - navbarOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = useCallback(() => {
    const sections = [
      { id: "about", ref: aboutRef },
      { id: "whoAreWe", ref: whoWeAreRef },
      { id: "whyUs", ref: whyUsRef },
      { id: "contact", ref: contactRef },
    ];

    let closestSection = "about";
    let minDistance = Number.MAX_VALUE;

    for (const section of sections) {
      const sectionTop = section.ref.current?.getBoundingClientRect().top || 0;
      const distanceFromTop = Math.abs(sectionTop - 80);

      if (distanceFromTop < minDistance) {
        minDistance = distanceFromTop;
        closestSection = section.id;
      }
    }

    setActiveSection(closestSection);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (aboutRef.current) {
      const navbarOffset = 80;
      const offsetPosition = aboutRef.current.offsetTop - navbarOffset;
      window.scrollTo({ top: offsetPosition });
    }
  }, []);

  return (
    <>
      <NavBar scrollToSection={scrollToSection} activeSection={activeSection} />
      <Main
        aboutRef={aboutRef}
        whoWeAreRef={whoWeAreRef}
        whyUsRef={whyUsRef}
        contactRef={contactRef}
      />
    </>
  );
}

export default App;
