import CarouselReact from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

type CarouselProps = {
  images: string[];
};

const Carousel = ({ images }: CarouselProps) => {
  const uniqueImages = [...new Set(images)];
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 1 },
    desktop: { breakpoint: { max: 1024, min: 768 }, items: 1 },
    tablet: { breakpoint: { max: 768, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  const divClasses = "card w-full h-auto flex items-center justify-center";
  const imgClasses = "w-full h-[400px] object-cover rounded-md";

  if (uniqueImages.length === 1) {
    return (
      <div className={divClasses}>
        <img
          className={imgClasses}
          src={uniqueImages[0]}
          alt="Location"
        />
      </div>
    );
  }

  return (
    <CarouselReact
      responsive={responsive}
      arrows={uniqueImages.length > 1}
      autoPlay={false}
      className="w-full"
      centerMode={false}
      infinite={false}
      autoPlaySpeed={3000}
      containerClass="carousel-container w-full"
      itemClass="carousel-item px-2"
    >
      {uniqueImages.map((image, index) => (
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
