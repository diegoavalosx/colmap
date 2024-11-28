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
      <div className="h-screen bg-deluxe-gray">
        <div
          id={id}
          ref={ref}
          className="h-full bg-deluxe-black text-white p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fadeIn rounded-bl-custom-br "
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
            <h1 className="text-3xl md:text-4xl font-bold">WHY US</h1>
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="p-6 bg-gray-800 rounded-lg shadow-lg hover:scale-105 transition-transform"
              >
                <h3 className="text-xl font-semibold mb-2 flex items-start space-x-3">
                  {feature.title}
                </h3>
                <p className="text-sm font-light">{feature.text}</p>
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
