import { forwardRef } from "react";

type WhyUsProps = {
  refs: {
    whyUsRef: React.RefObject<HTMLDivElement>;
  }
}
const WhyUs = forwardRef ((props, ref) => {  
  
  return (
    <div className="h-screen bg-green-400" ref={ref}>
      <h1>Why us</h1>
    </div>
  );
  });
  
  export default WhyUs;