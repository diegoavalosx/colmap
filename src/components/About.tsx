import Main from "../components/Main";
import WhoWR from "../components/WhoWR";
import WhyUs from "../components/WhyUs";
import Contact from "./Contact";

type AboutProps = {
  refs: {
    mainRef: React.RefObject<HTMLDivElement>;
    whoWeAreRef: React.RefObject<HTMLDivElement>;
    whyUsRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  };
};

const About: React.FC<AboutProps> = ({ refs }) => {
  return (
    <div className="h-full pt-20">
      <Main ref={refs.mainRef} />
      <WhoWR ref={refs.whoWeAreRef} />
      <WhyUs ref={refs.whyUsRef} />
      <Contact ref={refs.contactRef} />
      
    </div>
  );
};

export default About;
