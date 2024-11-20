import { forwardRef } from "react";

interface WhoWeAreProps {
  id?: string;
  goBackToHome?: () => void;
}

const features = [
  {
    id: 1,
    title: "Expert Management",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    id: 2,
    title: "Tailored Campaigns",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
  {
    id: 3,
    title: "High Visibility",
    text: "Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum.",
  },
];

const WhoWeAre = forwardRef<HTMLDivElement, WhoWeAreProps>(
  ({ id, goBackToHome }, ref) => {
    return (
      <div
        ref={ref}
        id={id}
        className="h-full bg-deluxe-black text-white p-12 md:p-20 grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn"
      >
        <div className="space-y-6 flex flex-col justify-center">
          {goBackToHome ? (
            <button
              type="button"
              className="text-2xl font-bold mb-4 absolute top-20 left-20 hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
              onClick={() => goBackToHome()}
            >
              GO BACK TO HOME
            </button>
          ) : null}
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="p-6 bg-gray-800 rounded-lg shadow-lg hover:scale-105 transition-transform"
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm font-light">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

WhoWeAre.displayName = "WhoWeAre";

export default WhoWeAre;
