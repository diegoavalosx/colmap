import { forwardRef } from "react";
import {
  FaBullhorn,
  FaChartLine,
  FaEye,
  FaFileAlt,
  FaSyncAlt,
} from "react-icons/fa";

interface WhoWeAreProps {
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

const WhoWeAre = forwardRef<HTMLDivElement, WhoWeAreProps>(
  ({ id, goBackToHome }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="min-h-screen h-auto p-6 bg-deluxe-black text-white md:p-16 md:grid-cols-2 gap-6 md:gap-12 animate-fadeIn"
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
        <div className="space-y-6 flex flex-col w-full h-full self-stretch mb-10">
          <h1 className="text-2xl  md:text-4xl font-bold mb-0 md:mb-4 text-center">
            WHO WE ARE
          </h1>
          <p className="text-lg md:text-xl font-light leading-relaxed">
            Oohyeah is a boutique outdoor media agency specializing in{" "}
            <span className="text-ooh-yeah-pink font-bold">distinctive</span>{" "}
            guerrilla marketing. We manage the entire process from design to
            installation.
          </p>
          <p className="text-lg md:text-xl font-light leading-relaxed">
            Our skilled team provides personalized service and frequent campaign
            refreshes to ensure your message remains{" "}
            <span className="text-ooh-yeah-pink font-bold">impactful</span>.
            Expect innovative outdoor advertising tailored to your needs.
          </p>
          <p className="text-lg md:text-xl font-light leading-relaxed">
            Wild posting creates an urban appeal that{" "}
            <span className="text-ooh-yeah-pink font-bold">captivates</span>{" "}
            audiences and{" "}
            <span className="text-ooh-yeah-pink font-bold">dominates</span>{" "}
            prime territories. It's efficient, cost-effective, and designed for
            maximum visibility.
          </p>
          <p className="text-lg md:text-xl font-light leading-relaxed">
            By combining the classic power of posters with innovative
            strategies, we ensure your brand’s message resonates in an{" "}
            <span className="text-ooh-yeah-pink font-bold">authentic</span>,
            impactful way.
          </p>
        </div>
        <div className="flex flex-wrap h-auto items-center justify-center gap-8 w-full">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="transition-transform flex text-center w-auto duration-300 text-white text-md mb-6 flex-shrink-0"
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

WhoWeAre.displayName = "WhoWeAre";

export default WhoWeAre;
