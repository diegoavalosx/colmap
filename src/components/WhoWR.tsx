import { forwardRef } from "react";
import bgImage from "../assets/bg-image.png";

const WhoWR = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="h-full bg-black p-16 flex flex-col items-center" ref={ref}>
      <h1 className="text-white text-3xl font-bold mr-5 transition-transform duration-300 hover:scale-105 mb-4">
        WHO WE ARE
      </h1>
      <h2 className="text-white w-2/3 font-bold mb-6 text-xl">
        Oohyeah is a boutique outdoor media agency specializing in{" "}
        <span className="text-ooh-yeah-pink">distinctive</span> guerrilla
        marketing. We offer <span className="text-ooh-yeah-pink">wild</span>{" "}
        posting, and chalk stencils, managing the entire process from design to
        installation.
      </h2>
      <div className="flex text-base text-white font-bold space-x-4">
        <div className="flex-1">
          <img className="pb-6" src={bgImage} alt="first" />
          <p>
            Oohyeah is a boutique outdoor media agency specializing in
            distinctive guerrilla marketing. We offer wild posting, and chalk
            stencils, managing the entire process from design to installation.
          </p>
        </div>
        <div className="flex-1">
          <img className="pb-6" src={bgImage} alt="first" />
          <p>
            Our skilled team provides personalized service and frequent campaign
            refreshes, ensuring your message remains impactful. With Oohyeah,
            expect innovative, conversation-starting outdoor advertising
            tailored to your needs.
          </p>
        </div>
        <div className="flex-1">
          <img className="pb-6" src={bgImage} alt="first" />
          <ul className="list-disc list-inside">
            <li>Daily inspections</li>
            <li>Industry-leading refresh frequency</li>
            <li>High quality marketing collateral</li>
            <li>State-of-the-art campaign completion videos</li>
            <li>Weekly updates including posting lists and site maps</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default WhoWR;
