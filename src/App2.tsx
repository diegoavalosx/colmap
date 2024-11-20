import { useState } from "react";
import Home from "./components/Home";
import WhoWeAre from "./components/WhoWeAre";
import WhyUs from "./components/WhyUs";
import Contact from "./components/Contact";

function App2() {
  const [currentSection, setCurrentSection] = useState<string>("home");

  const navigateToSection = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="h-screen bg-deluxe-gray text-deluxe-black font-sans">
      {currentSection === "home" && (
        <Home navigateToSection={navigateToSection} />
      )}
      {currentSection === "whoWeAre" && (
        <WhoWeAre goBackToHome={() => navigateToSection("home")} />
      )}
      {currentSection === "whyUs" && (
        <WhyUs goBackToHome={() => navigateToSection("home")} />
      )}
      {currentSection === "contact" && (
        <Contact goBackToHome={() => navigateToSection("home")} />
      )}
    </div>
  );
}

export default App2;
