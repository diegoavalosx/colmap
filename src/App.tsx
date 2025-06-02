import { forwardRef, useRef, useState, useEffect } from "react";
import WhoWeAre from "./components/WhoWeAre";
import Contact from "./components/Contact";
import NavBar from "./components/NavBar";
import defaultImage from "./assets/wooyeahPhotoPoster.jpg";

function App() {
  const homeRef = useRef<HTMLDivElement>(null);
  const whoWeAreRef = useRef<HTMLDivElement>(null);
  const whyUsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState<string>("home");

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

  return (
    <div className="h-screen bg-deluxe-black text-deluxe-black font-sans">
      <NavBar
        ref={navBarRef}
        scrollToSection={scrollToSection}
        activeSection={currentSection}
      />
      <HomeDummy id="home" ref={homeRef} />
      <WhoWeAre id="whoWeAre" ref={whoWeAreRef} />
      <Contact id="contact" ref={contactRef} />
    </div>
  );
}

interface HomeDummyProps {
  id?: string;
}

const HomeDummy = forwardRef<HTMLDivElement, HomeDummyProps>(({ id }, ref) => {
  return (
    <div
      id={id}
      ref={ref}
      className="max-h-[48rem] h-auto md:h-[48rem] w-full bg-deluxe-gray overflow-hidden animate-fadeIn sm:pt-0 pt-[4rem]"
    >
      <img
        src="https://firebasestorage.googleapis.com/v0/b/colmap-9f519.firebasestorage.app/o/settings%2Fhomepage-image.jpg?alt=media"
        alt="homepage"
        className="object-contain md:object-cover h-full w-full
            transition-opacity duration-500 ease-out"
        loading="eager"
        decoding="async"
        onError={({ currentTarget }) => {
          currentTarget.src = defaultImage;
        }}
      />
    </div>
  );
});

export default App;
