import { forwardRef } from "react";
import {
  FaEye,
  FaSyncAlt,
  FaBullhorn,
  FaChartLine,
  FaFileAlt,
} from "react-icons/fa";

interface WhyUsProps {
  id?: string;
  goBackToHome?: () => void;
}

const features = [
  {
    id: 1,
    title: "Daily inspections to ensure visibility",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
    icon: <FaEye />,
  },
  {
    id: 2,
    title: "Industry-leading refresh frequency",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
    icon: <FaSyncAlt />,
  },
  {
    id: 3,
    title: "High-quality marketing materials",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
    icon: <FaBullhorn />,
  },
  {
    id: 4,
    title: "State-of-the-art campaign tracking",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
    icon: <FaChartLine />,
  },
  {
    id: 5,
    title: "Weekly updates with detailed reports",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
    icon: <FaFileAlt />,
  },
];

const WhyUs = forwardRef<HTMLDivElement, WhyUsProps>(
  ({ id, goBackToHome }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="h-auto flex flex-col min-h-screen flex-grow bg-white text-gray-900 p-6 md:p-16 items-center justify-center gap-20 animate-fadeIn"
      >
        {goBackToHome ? (
          <button
            type="button"
            className="text-lg md:text-3xl font-bold mb-4 absolute top-7 left-7 md:top-16 md:left-16 hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
            onClick={() => goBackToHome()}
          >
            BACK
          </button>
        ) : null}
        <div className="space-y-6 flex flex-col justify-center items-center w-auto h-full text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-0 md:mb-4 text-center tracking-tight">
            WHY US
          </h1>
          <div className="space-y-4 w-2/3">
            <p className="text-lg md:text-xl font-light leading-relaxed">
              Wild posting creates an urban appeal that captivates audiences and
              dominates prime territories. It's efficient, cost-effective, and
              designed for maximum visibility.
            </p>
            <p className="text-lg md:text-xl font-light leading-relaxed">
              By combining the classic power of posters with innovative
              strategies, we ensure your brand’s message resonates in an
              authentic, impactful way.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap h-auto items-center justify-center gap-8 w-full">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="transition-transform flex text-center self-center w-auto duration-300 text-deluxe-black mb-6 flex-shrink-0"
            >
              <h3 className="text-lg text-center font-semibold mb-2 flex items-center gap-2">
                {feature.icon}
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

WhyUs.displayName = "WhyUs";

export default WhyUs;
