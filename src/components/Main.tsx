import { forwardRef } from "react";
import bgImage from "../assets/bg-image-2.png";

const Main = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="h-3/4 flex bg-gray-900" ref={ref}>
      <div className="flex h-full w-full bg-white rounded-br-custom-br">
        <div className="flex justify-center w-2/4 flex-col p-6 h-full">
          <h1 className="text-black text-4xl font-bold mr-5 transition-transform duration-300 hover:scale-105 mb-6">
            MAKE YOUR BRAND{" "}
            <span className="text-ooh-yeah-pink appear-on-load">
              UNMISSABLE.
            </span>
          </h1>
          <h2 className="font-bold">
            Boutique outdoor media solutions, from creative design to impactful
            installation, tailored to captivate and engage.
          </h2>
        </div>
        <div className="flex justify-center w-2/4 flex-col h-full bg-gray-900">
          <img
            className="h-full opacity-70 rounded-br-custom-br"
            src={bgImage}
            alt=""
          />
        </div>
      </div>
    </div>
  );
});

export default Main;
