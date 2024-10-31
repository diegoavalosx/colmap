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
          className="h-full w-full object-cover opacity-50"
          src={bgImage}
          alt="background"
        />
        <div className="absolute inset-0 flex items-center justify-center w-2/4">
          <h1 className="text-white text-3xl font-bold">
            We are a boutique outdoor media agency specializing in distinctive
            guerrilla marketing
          </h1>
        </div>
      </div>
    </div>
  );
});

export default Main;
