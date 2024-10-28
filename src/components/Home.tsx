const Home = () => {
    const homeRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={homeRef} className="mt-10  ms-5 font-semibold text-wrap">
            <h1>Home
            </h1>
            <div className="h-[1000px] bg-[#92A8D1]"></div>
      </div>
    );
}

export default Home;