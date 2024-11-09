import About from "./About";
import WhoWeAre from "./WhoWeAre";
import WhyUs from "./WhyUs";
import Contact from "./Contact";

interface AboutProps {
  aboutRef: React.RefObject<HTMLDivElement>;
  whoWeAreRef: React.RefObject<HTMLDivElement>;
  whyUsRef: React.RefObject<HTMLDivElement>;
  contactRef: React.RefObject<HTMLDivElement>;
}

const Main: React.FC<AboutProps> = ({
  aboutRef,
  whoWeAreRef,
  whyUsRef,
  contactRef,
}) => {
  return (
    <div className="h-full pt-20">
      <div id="about" className="h-3/4" ref={aboutRef}>
        <About />
      </div>
      <div id="whoAreWe" className="h-full" ref={whoWeAreRef}>
        <WhoWeAre />
      </div>
      <div id="whyUs" className="h-full" ref={whyUsRef}>
        <WhyUs />
      </div>
      <div id="contact" className="h-full" ref={contactRef}>
        <Contact />
      </div>
    </div>
  );
};

export default Main;
