import { forwardRef } from "react";
import whyUsImage from '../assets/whyohyeah.png'
import punto from '../assets/punto-info.png'

type WhyUsProps = {
  refs: {
    whyUsRef: React.RefObject<HTMLDivElement>;
  }
}
const WhyUs = forwardRef ((props, ref) => {  
  
  return (
    <>
    <div ref={ref}>
    <h1 className="text-4xl font-bold text-center m-8"> Why us</h1>
    </div>
    <div className="h-full w-full flex mb-5" >
      
      <div className="w-1/2 flex items-center justify-center ">
        
          
        </div>
      <div className="relative h-3/4 w-full">
        <img
          className="h-full w-full object-cover opacity-100"
          src={whyUsImage}
          alt="background"
        />
        
        
      </div>
    </div>
    </>
  );
  });
  
  export default WhyUs;