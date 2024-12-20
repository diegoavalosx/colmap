import { forwardRef } from "react";
import Carousel from "./Carousel";

interface WhoWeAreProps {
  id?: string;
}

const WhoWeAre = forwardRef<HTMLDivElement, WhoWeAreProps>(({ id }, ref) => {
  return (
    <div
      id={id}
      ref={ref}
      className="min-h-screen h-auto p-6 bg-deluxe-black text-white md:p-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 animate-fadeIn"
    >
      <div className="space-y-6 flex flex-col justify-center w-full h-full self-stretch">
        <h1 className="text-2xl md:text-4xl font-bold mb-0 md:mb-4 text-center md:text-left">
          WHO WE ARE
        </h1>
        <p className="text-lg font-light leading-relaxed">
          Oohyeah is a boutique outdoor media agency specializing in{" "}
          <span className="text-ooh-yeah-pink font-medium">distinctive</span>{" "}
          guerrilla marketing. We manage the entire process from design to
          installation.
        </p>
        <p className="text-lg font-light leading-relaxed">
          Our skilled team provides personalized service and frequent campaign
          refreshes to ensure your message remains impactful. Expect innovative
          outdoor advertising tailored to your needs.
        </p>
      </div>
      <div className="flex justify-center w-full h-full">
        <Carousel />
      </div>
    </div>
  );
});

WhoWeAre.displayName = "WhoWeAre";

export default WhoWeAre;
