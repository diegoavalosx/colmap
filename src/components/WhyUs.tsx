import { forwardRef } from "react";
interface WhyUsProps {
  id?: string;
  goBackToHome?: () => void;
}

const features = [
  {
    id: 1,
    title: "Daily inspections to ensure visibility",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    id: 2,
    title: "Industry-leading refresh frequency",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    id: 3,
    title: "High-quality marketing materials",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    id: 4,
    title: "State-of-the-art campaign tracking",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    id: 5,
    title: "Weekly updates with detailed reports",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
];

const WhyUs = forwardRef<HTMLDivElement, WhyUsProps>(
  ({ id, goBackToHome }, ref) => {
    return (
      <div className="h-auto min-h-screen flex flex-col bg-deluxe-gray">
        <div
          id={id}
          ref={ref}
          className="h-full flex-grow bg-deluxe-black text-white p-6 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center animate-fadeIn rounded-none"
        >
          {goBackToHome ? (
            <button
              type="button"
              className="text-lg md:text-3xl font-bold mb-4 absolute top-7 left-7 md:top-20 md:left-20 hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
              onClick={() => goBackToHome()}
            >
              BACK
            </button>
          ) : null}
          <div className="space-y-6 flex flex-col justify-center w-full h-full">
            <h1 className="text-2xl md:text-4xl font-bold mb-0 md:mb-4 text-center md:text-left ">
              WHY US
            </h1>
            <div className="space-y-4">
              <p className="text-lg font-light leading-relaxed">
                Wild posting creates an urban appeal that captivates audiences
                and dominates prime territories. It's efficient, cost-effective,
                and designed for maximum visibility.
              </p>
              <p className="text-lg font-light leading-relaxed">
                By combining the classic power of posters with innovative
                strategies, we ensure your brand’s message resonates in an
                authentic, impactful way.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-6 grid-rows-2 md:grid-rows-1">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="p-6 bg-gray-800 rounded-lg shadow-lg hover:scale-105 transition-transform"
              >
                <h3 className="text-md md:text-xl font-semibold flex items-start space-x-3">
                  {feature.title}
                </h3>
                <p className="hidden md:block text-sm font-light">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

WhyUs.displayName = "WhyUs";

export default WhyUs;
