import React from 'react'

type AboutProps = {
  refs: {
    homeRef: React.RefObject<HTMLDivElement>;
    whoWeAreRef: React.RefObject<HTMLDivElement>;
    whyUsRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  };
}

const About:React.FC<AboutProps> = ({ refs}) => {
  
  return (
    <div>
    <div ref={refs.homeRef} className="h-screen bg-blue-200">Home Section</div>
    <div ref={refs.whoWeAreRef} className="h-screen bg-green-200">Who We Are Section</div>
    <div ref={refs.whyUsRef} className="h-screen bg-yellow-200">Why Us Section</div>
    <div ref={refs.contactRef} className="h-screen bg-red-200">Contact Section</div>
  </div>
  );
};

export default About;
