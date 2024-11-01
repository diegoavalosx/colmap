import { forwardRef } from "react";
import whyUsImage from '../assets/whyohyeah.png'
import icon from '../assets/punto-info.png'

type WhyUsProps = {
  refs: {
    whyUsRef: React.RefObject<HTMLDivElement>;
  }
}
const WhyUs = forwardRef ((props, ref) => {  
  
  return (
        <div className="flex flex-col md:flex-row items-center justify-between p-16 bg-gray-50 rounded-lg shadow-md pt-20 pb-20" ref={ref}>
          <div className="md:w-1/2 me-5 text-center">
            <h1 className="text-4xl font-bold mb-6 font-serif uppercase">Why us</h1>
              <p className="text-lg font-sans text-black mb-4">
                 We are the best option because offer...
              </p>
                <ul className="list-none space-y-4">
                  <li className="flex items-center">
                    <img src={icon} alt="Ícono" className="w-5 h-5 mr-2"/>
                    Daily inspections
                  </li>
                  <li className="flex items-center">
                    <img src={icon} alt="Ícono" className="w-5 h-5 mr-2"/>
                    Industry-leading refresh frequency
                  </li>
                  <li className="flex items-center">
                    <img src={icon} alt="Ícono" className="w-5 h-5 mr-2"/>
                    High-quality marketing collateral
                  </li>
                  <li className="flex items-center">
                    <img src={icon} alt="Ícono" className="w-5 h-5 mr-2"/>
                    State-of-the-art compaign completion videos
                  </li>
                  <li className="flex items-center">
                    <img src={icon} alt="Ícono" className="w-5 h-5 mr-2"/>
                    Comprehensive reports delivered within 24 hours of each posting</li>
                  <li className="flex items-center">
                    <img src={icon} alt="Ícono" className="w-5 h-5 mr-2"/>
                    Weekly updates including posting lists and site maps</li>
                </ul>
          </div> 
          <div className="md:w-1/2 mt-6 md:mt-0">
            <img
              className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
              src={whyUsImage}
              alt="background"/>
          </div>
    </div>
    
  );
  });
  
  export default WhyUs;