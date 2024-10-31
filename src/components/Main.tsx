import { forwardRef } from "react";
import bgImage from "../assets/bg-image.png";


type MainProps = {
  refs: {
    mainRef: React.RefObject<HTMLDivElement>;
  }
}

const Main = forwardRef((props, ref) => {
  return (
    <div className="h-full w-full flex" ref={ref}>
      <div className="relative h-3/4 w-full bg-black">
        <img
          className="h-80% w-80% object-cover opacity-70"
          src={bgImage}
          alt="background"
        />
        <div className="absolute inset-0 flex items-center justify-center w-2/4">
          <h1 className="text-white text-3xl font-bold mr-5">
            We are a boutique outdoor media agency specializing in distinctive
            guerrilla marketing
          </h1>
        </div>
      </div>
    </div>
  );
});

export default Main;
