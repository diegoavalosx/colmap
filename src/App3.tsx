import { forwardRef, useRef, useState, useEffect } from "react";
import WhoWeAre from "./components/WhoWeAre";
import Contact from "./components/Contact";
import NavBar from "./components/NavBar";
import defaultImage from "./assets/wooyeahPhotoPoster.jpg";
import { fetchHomepageImageUrl } from "./firebase-public";

function App3() {
  const homeRef = useRef<HTMLDivElement>(null);
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState<string>("home");
  const [homepageImageUrl, setHomepageImageUrl] =
    useState<string>(defaultImage);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  useEffect(() => {
    const getHomepageImage = async () => {
      try {
        setImageLoading(true);
        const imageUrl = await fetchHomepageImageUrl();
        if (imageUrl) {
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            setHomepageImageUrl(imageUrl);
            setImageLoading(false);
          };
          img.onerror = () => {
            console.error("Failed to load image, using default");
            setImageLoading(false);
          };
        } else {
          setImageLoading(false);
        }
      } catch (error) {
        console.error("Error fetching homepage image:", error);
        setImageLoading(false);
      }
    };

    getHomepageImage();
  }, []);

  useEffect(() => {
    const refMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
      home: homeRef,
      whoWeAre: whoWeAreRef,
      whyUs: whyUsRef,
      contact: contactRef,
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const sectionId = Object.keys(refMap).find(
            (key) => refMap[key].current === entry.target
          );
          if (sectionId) {
            setCurrentSection(sectionId);
          }
        }
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    for (const ref of Object.values(refMap)) {
      if (ref.current) {
        observer.observe(ref.current);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const navbarOffset = navBarRef.current?.clientHeight || 120;
    const refMap: { [key: string]: React.RefObject<HTMLDivElement> } = {
      home: homeRef,
      whoWeAre: whoWeAreRef,
      contact: contactRef,
    };
    const sectionRef = refMap[sectionId];
    if (sectionRef?.current) {
      const offsetPosition = sectionRef.current.offsetTop - navbarOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (imageLoading) {
    return (
      <div className="h-screen bg-deluxe-black text-deluxe-black font-sans">
        <NavBar
          ref={navBarRef}
          scrollToSection={scrollToSection}
          activeSection={currentSection}
        />
        <div className="max-h-[48rem] w-full bg-deluxe-gray animate-pulse flex items-center justify-center sm:pt-0 pt-[4rem]" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-deluxe-black text-deluxe-black font-sans">
      <NavBar
        ref={navBarRef}
        scrollToSection={scrollToSection}
        activeSection={currentSection}
      />
      <HomeDummy id="home" ref={homeRef} imageUrl={homepageImageUrl} />
      <WhoWeAre id="whoWeAre" ref={whoWeAreRef} />
      <Contact id="contact" ref={contactRef} />
    </div>
  );
}

interface HomeDummyProps {
  id?: string;
  imageUrl: string;
}

const HomeDummy = forwardRef<HTMLDivElement, HomeDummyProps>(
  ({ id, imageUrl }, ref) => {
    return (
      <div
        id={id}
        ref={ref}
        className="max-h-[48rem] w-full bg-deluxe-gray overflow-hidden animate-fadeIn sm:pt-0 pt-[4rem]"
      >
        <img
          src={imageUrl}
          alt="homepage"
          className="object-cover md:object-contain h-full w-full"
          onError={(e) => {
            // Fallback to default image if loading fails
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
      </div>
    );
  }
);

export default App3;
