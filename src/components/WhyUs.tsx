import { forwardRef } from "react";
import whyUsImage from "../assets/whyohyeah.png";

const WhyUs = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      className="h-full bg-gray-900 p-16 flex flex-col items-center justify-center rounded-bl-custom-br"
      ref={ref}
    >
      <h1 className="text-white text-3xl font-bold mr-5 transition-transform duration-300 hover:scale-105 mb-4">
        WHY US
      </h1>
      <div className="flex p-5">
        <div className="flex-1 p-6">
          <img
            className="h-full transition-transform duration-300 hover:scale-105"
            src={whyUsImage}
            alt="background"
          />
        </div>
        <div className="flex-1 mt-6 md:mt-0 p-2 h-full items-center flex">
          <p className="text-white font-bold text-lg">
            Wild posting brings a contemporary urban feel that captivates
            audiences and creates a strong street-level presence. It allows
            brands to dominate prime territories with maximum impact while
            maintaining minimal spend, making it an efficient choice for those
            seeking high visibility without breaking the budget. Leveraging the
            classic power of posters, wild posting campaigns harness a proven
            format to amplify brand messaging and resonate with passersby in an
            authentic and engaging way.
          </p>
        </div>
      </div>
    </div>
  );
});

export default WhyUs;
