import whyUsImage from "../assets/whyohyeah.png";

const WhyUs = () => {
  return (
    <div className="h-full bg-black p-8 md:p-16 flex flex-col items-center justify-center rounded-bl-custom-br">
      <h1 className="text-white text-3xl font-bold mr-5 transition-transform duration-300 hover:scale-105 mb-4">
        WHY US
      </h1>
      <div className="flex flex-col md:flex-row w-full items-center justify-center">
        <div className="flex-1 p-2 items-center justify-center">
          <img
            className="w-full h-auto b-6 transition-transform duration-300 hover:scale-105"
            src={whyUsImage}
            alt="background"
          />
        </div>
        <div className="flex-1 mt-6 md:mt-0 p-2 h-full items-center flex justify-center">
          <p className="text-white font-bold text-lg text-center">
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
};

export default WhyUs;
