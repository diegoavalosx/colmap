import CarouselReact from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import img1 from "../assets/carousel-images/1.png";
import img2 from "../assets/carousel-images/2.png";
import img3 from "../assets/carousel-images/3.png";
import img4 from "../assets/carousel-images/4.png";
import img5 from "../assets/carousel-images/5.png";
import img6 from "../assets/carousel-images/6.png";
import img7 from "../assets/carousel-images/7.png";
import img8 from "../assets/carousel-images/8.png";
import img9 from "../assets/carousel-images/9.png";

const Carousel = () => {
  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 1 },
    desktop: { breakpoint: { max: 1024, min: 768 }, items: 1 },
    tablet: { breakpoint: { max: 768, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };
  const divClasses = "card w-full h-auto flex items-center justify-center";
  const imgClasses = "w-full h-[400px] object-cover rounded-md";

  return (
    <CarouselReact
      responsive={responsive}
      className="w-full"
      centerMode={false}
      infinite={true}
      autoPlay={true}
      autoPlaySpeed={3000}
      arrows={false}
      containerClass="carousel-container w-full"
      itemClass="carousel-item px-2"
    >
      {images.map((image, index) => (
        <div key={image} className={divClasses}>
          <img
            className={imgClasses}
            src={image}
            alt={`Carousel ${index + 1}`}
          />
        </div>
      ))}
    </CarouselReact>
  );
};
export default Carousel;
