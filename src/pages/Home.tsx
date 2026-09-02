import { useEffect, useRef, useState } from "react";
import logo from "../assets/oohyeah-logo-white.png";
import { homepageGallery } from "../data/homepageGallery";
import "../styles/home.css";

const contactEmail = "hello@oohyeahmedia.com";

type MenuSection = "about" | "contact";

const menuItems: Array<{ id: MenuSection; label: string }> = [
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const formatTimestamp = (date: Date) => {
  const dateLabel = date
    .toLocaleDateString("en-US", { month: "long", day: "numeric" })
    .toUpperCase();
  const timeLabel = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const timeZone = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  return `${dateLabel}, ${timeLabel}${timeZone ? ` (${timeZone})` : ""}`;
};

const Home = () => {
  const [now, setNow] = useState(() => new Date());
  const [activeSection, setActiveSection] =
    useState<MenuSection>("about");
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

      const isAtStart = gallery.scrollLeft <= 0 && event.deltaY < 0;
      const isAtEnd =
        gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 1 &&
        event.deltaY > 0;

      if (isAtStart || isAtEnd) return;

      event.preventDefault();
      gallery.scrollLeft += event.deltaY;
    };

    gallery.addEventListener("wheel", handleWheel, { passive: false });
    return () => gallery.removeEventListener("wheel", handleWheel);
  }, []);

  const handleGalleryKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    galleryRef.current?.scrollBy({
      left: direction * Math.min(window.innerWidth * 0.72, 715),
      behavior: "smooth",
    });
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "contact":
        return (
          <p>
            Ready to put your brand on the street? Email{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        );
      case "about":
      default:
        return (
          <p>
            OOHYEAH is a boutique outdoor media agency specializing in
            distinctive guerrilla marketing, wild posting, and campaign
            installations from concept to street.
          </p>
        );
    }
  };

  return (
    <main className="oohyeah-home-page">
      <div className="oohyeah-home-shell">
        <header className="oohyeah-home-header">
          <a className="oohyeah-home-logo" href="/" aria-label="Oohyeah home">
            <img src={logo} alt="Oohyeah" />
          </a>

          <div className="oohyeah-home-intro">
            <nav aria-label="Agency information">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  id={`oohyeah-home-tab-${item.id}`}
                  type="button"
                  aria-controls="oohyeah-home-menu-content"
                  aria-pressed={activeSection === item.id}
                  className={`oohyeah-home-nav-item ${
                    activeSection === item.id ? "is-active" : ""
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
              <a className="oohyeah-home-nav-item" href="/login">
                Client Portal
              </a>
            </nav>
            <div
              key={activeSection}
              id="oohyeah-home-menu-content"
              className="oohyeah-home-content"
              role="region"
              aria-labelledby={`oohyeah-home-tab-${activeSection}`}
              aria-live="polite"
            >
              {renderSectionContent()}
            </div>
          </div>
        </header>

        <section className="oohyeah-home-gallery-region" aria-label="Selected work">
          <div
            ref={galleryRef}
            className="oohyeah-home-gallery"
            role="region"
            aria-label="Selected campaign gallery. Use the arrow keys or swipe to browse."
            tabIndex={0}
            onKeyDown={handleGalleryKeyDown}
          >
            {homepageGallery.map((image, index) => (
              <figure className="oohyeah-home-slide" key={image.src}>
                <img
                  src={image.src}
                  alt={image.alt}
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    currentTarget.src = homepageGallery[0].src;
                  }}
                />
              </figure>
            ))}
          </div>
        </section>

        <time className="oohyeah-home-time" dateTime={now.toISOString()}>
          {formatTimestamp(now)}
        </time>
      </div>
    </main>
  );
};

export default Home;
