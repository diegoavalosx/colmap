export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl md:text-9xl font-bold text-ooh-yeah-pink mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-4xl font-semibold mb-4">
          Page not found!
        </h2>
        <p className="text-base md:text-lg text-gray-300 mb-8">
          We're sorry, the page you're looking for does not exist
        </p>
        <a
          href="/v3"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base
              md:text-lg font-medium rounded-md text-white bg-ooh-yeah-pink hover:bg-ooh-yeah-pink-700
              transition-colors duration-200"
        >
          Back
        </a>
      </div>
    </div>
  );
}
