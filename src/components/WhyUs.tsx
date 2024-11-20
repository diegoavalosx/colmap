import { forwardRef } from "react";
import whyUsImage from "../assets/whyohyeah.png";
interface WhyUsProps {
  id?: string;
  goBackToHome?: () => void;
}

const WhyUs = forwardRef<HTMLDivElement, WhyUsProps>(
  ({ id, goBackToHome }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="h-full bg-deluxe-black text-white p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fadeIn"
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
        <div className="flex justify-center">
          <img
            src={whyUsImage}
            alt="Why Us"
            className="w-full max-w-[400px] object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold">WHY US</h1>
          <div className="space-y-4">
            <p className="text-lg font-light leading-relaxed">
              Wild posting creates an urban appeal that captivates audiences and
              dominates prime territories. It's efficient, cost-effective, and
              designed for maximum visibility.
            </p>
            <p className="text-lg font-light leading-relaxed">
              By combining the classic power of posters with innovative
              strategies, we ensure your brand’s message resonates in an
              authentic, impactful way.
            </p>
          </div>
          <ul className="space-y-3 text-lg font-light leading-relaxed">
            {[
              "Daily inspections to ensure visibility",
              "Industry-leading refresh frequency",
              "High-quality marketing materials",
              "State-of-the-art campaign tracking",
              "Weekly updates with detailed reports",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-start space-x-3 before:content-['✓'] before:text-ooh-yeah-pink before:text-xl"
              >
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

WhyUs.displayName = "WhyUs";

export default WhyUs;
