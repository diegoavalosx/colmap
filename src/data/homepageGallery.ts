import dknyNewYorkStories from "../assets/homepage/01-dkny-new-york-stories.webp";
import catsJellicleBall from "../assets/homepage/02-cats-jellicle-ball.webp";
import boomBoomBoom from "../assets/homepage/03-boom-boom-boom.webp";
import eatCouchSunset from "../assets/homepage/04-eat-couch-sunset.webp";
import earlyLifeCrisis from "../assets/homepage/05-early-life-crisis.webp";
import dontBeDumbScaffolding from "../assets/homepage/06-dont-be-dumb-scaffolding.webp";
import bookOfMormon from "../assets/homepage/07-book-of-mormon-wild-posting.webp";
import eatCouchChinatown from "../assets/homepage/08-eat-couch-chinatown.webp";
import dontBeDumbGreenpoint from "../assets/homepage/09-dont-be-dumb-greenpoint.webp";
import justiceEvictionCampaign from "../assets/homepage/10-justice-eviction-campaign.webp";
import juliaFoxStoopSale from "../assets/homepage/11-julia-fox-stoop-sale.webp";
import timesSquareStencil from "../assets/homepage/12-times-square-street-stencil.webp";
import dontBeDumbNight from "../assets/homepage/13-dont-be-dumb-night.webp";
import dontBeDumbStreet from "../assets/homepage/14-dont-be-dumb-street.webp";
import shippingPinkStencil from "../assets/homepage/15-shipping-pink-stencil.webp";
import killDickStencil from "../assets/homepage/16-kill-dick-stencil.webp";

type HomepageGalleryImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export const homepageGallery: HomepageGalleryImage[] = [
  {
    src: dknyNewYorkStories,
    alt: "DKNY New York Stories wild posting campaign on a city wall",
  },
  {
    src: catsJellicleBall,
    alt: "Cats The Jellicle Ball posters installed across a construction wall",
  },
  {
    src: timesSquareStencil,
    alt: "Yellow street stencil campaign photographed near Radio City Music Hall",
    objectPosition: "50% 100%",
  },
  {
    src: boomBoomBoom,
    alt: "Boom Boom Boom music posters installed on a street corner",
  },
  {
    src: eatCouchSunset,
    alt: "Eat Couch wild posting campaign photographed at sunset",
  },
  {
    src: earlyLifeCrisis,
    alt: "Early Life Crisis fashion posters installed along a city sidewalk",
  },
  {
    src: shippingPinkStencil,
    alt: "Bright pink campaign stencil installed on a SoHo sidewalk",
    objectPosition: "50% 100%",
  },
  {
    src: dontBeDumbScaffolding,
    alt: "Don't Be Dumb campaign posters under sidewalk scaffolding",
  },
  {
    src: bookOfMormon,
    alt: "Book of Mormon and Eat Couch posters covering an urban wall",
  },
  {
    src: eatCouchChinatown,
    alt: "Eat Couch wild postings installed on a Chinatown storefront",
  },
  {
    src: dontBeDumbStreet,
    alt: "Don't Be Dumb campaign stencil installed on a city sidewalk",
    objectPosition: "50% 100%",
  },
  {
    src: dontBeDumbGreenpoint,
    alt: "Don't Be Dumb campaign posters beside a Greenpoint subway entrance",
  },
  {
    src: justiceEvictionCampaign,
    alt: "Justice and tenant advocacy posters installed on a city building",
  },
  {
    src: juliaFoxStoopSale,
    alt: "Julia Fox stoop sale poster installed on a street newspaper box",
  },
  {
    src: killDickStencil,
    alt: "Black campaign stencil installed on a Queens sidewalk",
    objectPosition: "50% 100%",
  },
  {
    src: dontBeDumbNight,
    alt: "Don't Be Dumb street installation photographed at night",
  },
];
