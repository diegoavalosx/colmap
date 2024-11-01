import { forwardRef } from "react";

const Contact = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      className="h-full bg-white p-16 flex flex-col items-center justify-center"
      ref={ref}
    >
      <div className="pb-6">
        <h1 className="text-3xl font-bold">Got any ideas?</h1>
        <h2 className="font-bold mb-6 text-xl">We'd love to hear from you!</h2>
      </div>
      <div className="">
        <form
          className="flex flex-col font-bold space-y-4"
          action=""
          method="post"
        >
          <label htmlFor="POST-name">Name</label>
          <input
            className="border-solid border-2 rounded h-10 w-56"
            id="POST-name"
            type="text"
            name="name"
          />
          <label htmlFor="POST-name">Email</label>
          <input
            className="border-solid border-2 rounded h-10 w-56"
            id="POST-name"
            type="text"
            name="name"
          />
          <label htmlFor="POST-name">Message</label>
          <input
            className="border-solid border-2 rounded h-10 w-56"
            id="POST-name"
            type="text"
            name="name"
          />
          <button className="hover:text-ooh-yeah-pink" type="button">
            SEND
          </button>
        </form>
      </div>
    </div>
  );
});

export default Contact;
