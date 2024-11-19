import { useRef } from "react";
import Home from "./components/Home";
import WhoWeAre from "./components/WhoWeAre";
import WhyUs from "./components/WhyUs";
import Contact from "./components/Contact";

function App() {
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionId: string) => {
    const refMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
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
    <div className="h-screen bg-deluxe-gray text-deluxe-black font-sans">
      <Home scrollToSection={scrollToSection} />
      <WhoWeAre id="whoWeAre" ref={whoWeAreRef} />
      <WhyUs id="whyUs" ref={whyUsRef} />
      <Contact id="contact" ref={contactRef} />
    </div>
  );
}

export default App;
