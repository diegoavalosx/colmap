import "./App.css";
import About from "./components/About";
import NavBar from "./components/NavBar";

// import WhoWR from "./components/WhoWR";
import {useRef} from 'react'

function App() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const whoWeAreRef = useRef<HTMLDivElement | null>(null);
  const whyUsRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <NavBar
        refs = {{mainRef, whoWeAreRef, whyUsRef, contactRef}}/>
      <About refs= {{ whoWeAreRef, whyUsRef, contactRef, mainRef}}/>
    </div>
  );
}

export default App;
