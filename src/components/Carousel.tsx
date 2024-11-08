import CarouselReact from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import img1 from "../assets/carousel-images/img-1.png";
import img2 from "../assets/carousel-images/img-2.png";
import img3 from "../assets/carousel-images/img-3.png";
import img4 from "../assets/carousel-images/img-4.png";
import img5 from "../assets/carousel-images/img-5.png";
import img6 from "../assets/carousel-images/img-6.png";

const Carousel = () => {
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 4 },
    desktop: { breakpoint: { max: 1024, min: 768 }, items: 3 },
    tablet: { breakpoint: { max: 768, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };
  const divClases = "card bg-gray-800 rounded-lg mx-1";
  return (
    <div className="my-10 mx-auto max-w-6xl pt-20 bg-white">
      <h1 className="text-3xl font bold text-center mb-8">Carousel</h1>
      <CarouselReact
        responsive={responsive}
        className="bg-gray-900 p-4 rounded-lg"
        centerMode={true}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={2000}
      >
        <div className={divClases}>
          <img
            className="product-image w-full h-60 object-cover rounded-md"
            src={img1}
            alt=""
          />
        </div>
        <div className={divClases}>
          <img
            className="product-image w-full h-60 object-cover rounded-md"
            src={img2}
            alt=""
          />
        </div>
        <div className={divClases}>
          <img
            className="product-image w-full h-60 object-cover rounded-md"
            src={img3}
            alt=""
          />
        </div>
        <div className={divClases}>
          <img
            className="product-image w-full h-60 object-cover rounded-md"
            src={img4}
            alt=""
          />
        </div>
        <div className={divClases}>
          <img
            className="product-image w-full h-60 object-cover rounded-md"
            src={img5}
            alt=""
          />
        </div>
        <div className={divClases}>
          <img
            className="product-image w-full h-60 object-cover rounded-md"
            src={img6}
            alt=""
          />
        </div>
      </CarouselReact>
    </div>
  );
};
export default Carousel;
