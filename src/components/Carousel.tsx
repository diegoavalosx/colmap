import CarouselReact from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

type CarouselProps = {
  images: string[];
};

const Carousel = ({ images }: CarouselProps) => {
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
      arrows
      autoPlay={false}
      className="w-full"
      centerMode={false}
      infinite={true}
      autoPlaySpeed={3000}
      containerClass="carousel-container w-full"
      itemClass="carousel-item px-2"
    >
      {images.map((image, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <div key={index} className={divClasses}>
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
