import { forwardRef } from "react";
import WhyUsImage from '../assets/whyohyeah.png'

type WhoWRProps = {
  refs: {
    whoWeAreRef: React.RefObject<HTMLDivElement>;
  }
}
const WhoWR = forwardRef ((props, ref) => {  
  
  return (
    <div className="h-full w-full flex" ref={ref}>
      <div className="relative h-3/4 w-full bg-black">
        <img
          className="h-full w-full object-cover opacity-50"
          src={WhyUsImage}
          alt="background"
        />
        
        <div className="absolute inset-0 flex items-center justify-center w-2/4">
          <p className="text-white text-2xl font-bold">
          
          Our skilled team provides personalized service and frequent campaign refreshes,
          ensuring your message remains impactful. With Oohyeah, expect innovative,
          conversation-starting outdoor advertising tailored to your needs.

          </p>
        </div>
      </div>
    </div>
  );
  });
  
  export default WhoWR;