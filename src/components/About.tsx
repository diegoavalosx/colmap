import React from 'react'
import Main from '../components/Main'
import WhoWR from '../components/WhoWR';
import WhyUs from '../components/WhyUs';
import Contact from '../components/Contact'
import Carousel from '../components/Carousel'

type AboutProps = {
  refs: {
    mainRef: React.RefObject<HTMLDivElement>
    whoWeAreRef: React.RefObject<HTMLDivElement>;
    whyUsRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  };
}

const About:React.FC<AboutProps> = ({ refs}) => {
  
  return (
    <div>
    <Carousel />
    <Main ref={refs.mainRef}/>
    <WhoWR ref={refs.whoWeAreRef}/>
    <WhyUs ref={refs.whyUsRef}/>
    <Contact ref={refs.contactRef}/>
    <button 
      className='my-10 bg-black text-white'
      onClick={()=>{
        window.scroll({
          top:0,
          behavior: 'smooth'
        });
      }}>
      Top
    </button>
  </div>
  );
};

export default About;
