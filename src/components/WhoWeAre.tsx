import { forwardRef } from "react";
import Carousel from "./Carousel";

interface WhoWeAreProps {
  id?: string;
  goBackToHome?: () => void;
}

const WhoWeAre = forwardRef<HTMLDivElement, WhoWeAreProps>(
  ({ id, goBackToHome }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="h-screen bg-deluxe-black text-white md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn"
      >
        {goBackToHome ? (
          <button
            type="button"
            className="text-2xl font-bold mb-4 absolute top-20 left-20 hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
            onClick={() => goBackToHome()}
          >
            GO BACK TO HOME
          </button>
        ) : null}
        <div className="space-y-6 flex flex-col justify-center w-full h-full">
          <h1 className="text-4xl font-bold mb-4">WHO WE ARE</h1>
          <p className="text-lg font-light leading-relaxed">
            Oohyeah is a boutique outdoor media agency specializing in{" "}
            <span className="text-ooh-yeah-pink font-medium">distinctive</span>{" "}
            guerrilla marketing. We manage the entire process from design to
            installation.
          </p>
          <p className="text-lg font-light leading-relaxed">
            Our skilled team provides personalized service and frequent campaign
            refreshes to ensure your message remains impactful. Expect
            innovative outdoor advertising tailored to your needs.
          </p>
        </div>
        <div className="flex justify-center w-full h-full">
          <Carousel />
        </div>
      </div>
    );
  }
);

WhoWeAre.displayName = "WhoWeAre";

export default WhoWeAre;
