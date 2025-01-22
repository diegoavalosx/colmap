import type React from "react";
import { forwardRef, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import image from "../assets/carousel-images/3.png";

interface ContactProps {
  id?: string;
  goBackToHome?: () => void;
}

const Contact = forwardRef<HTMLDivElement, ContactProps>(
  ({ id, goBackToHome }, ref) => {
    const form = useRef<HTMLFormElement | null>(null);
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [messageError, setmessageError] = useState("");
    const [formSuccess, setformSuccess] = useState<string | null>(null);

    const validateForm = () => {
      let isValid = true;

      if (!form.current?.user_name.value) {
        setNameError("Name required");
        isValid = false;
        setTimeout(() => setNameError(""), 3000);
      } else {
        setNameError("");
      }

      const email = form.current?.user_email.value;
      if (!email) {
        setEmailError("Email required");
        isValid = false;
        setTimeout(() => setEmailError(""), 3000);
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        setEmailError("Invalid email");
        isValid = false;
      } else {
        setEmailError("");
      }

      if (!form.current?.message.value) {
        setmessageError("Message required");
        isValid = false;
        setTimeout(() => setmessageError(""), 3000);
      } else {
        setmessageError("");
      }
      return isValid;
    };
    const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (validateForm() && form.current) {
        emailjs
          .sendForm("service_8lw0vae", "template_oh3nnzt", form.current, {
            publicKey: "o1R8SWpVH1-dSQA6e",
          })
          .then(
            (result) => {
              console.log(result.text);
              setformSuccess("Form sent successfully");
              form.current?.reset();
              setTimeout(() => {
                setformSuccess(null);
              }, 3000);
            },
            (error) => {
              console.log("FAILED...", error.text);
              setformSuccess("Error sending form. Try again.");
              setTimeout(() => {
                setformSuccess(null);
              }, 3000);
            }
          );
      }
    };

    return (
      <div
        id={id}
        ref={ref}
        className="min-h-screen h-auto p-6 bg-deluxe-black text-white md:p-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 animate-fadeIn"
      >
        {goBackToHome ? (
          <button
            type="button"
            className="text-lg md:text-2xl font-bold mb-4 absolute top-7 left-7 md:top-16 md:left-16 hover:scale-110 hover:text-ooh-yeah-pink transition-colors duration-300"
            onClick={() => goBackToHome()}
          >
            BACK
          </button>
        ) : null}
        <div className="flex justify-center w-full h-full p-10">
          <img src={image} alt="ooh-yeah" className="rounded-md object-cover" />
        </div>
        <div className="space-y-6 flex flex-col justify-center w-full h-full self-stretch items-center">
          <h1 className="text-3xl font-bold">Request a consultation</h1>
          <h2 className="text-xl font-light">We'd love to hear from you!</h2>

          <form
            ref={form}
            onSubmit={sendEmail}
            className="flex flex-col items-center w-full max-w-md space-y-6"
          >
            <div className="w-full">
              <label htmlFor="POST-name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="POST-name"
                type="text"
                name="user_name"
                className="w-full border-2 border-gray-300 text-deluxe-black rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="POST-email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="POST-email"
                type="email"
                name="user_email"
                className="w-full border-2 border-gray-300 text-deluxe-black rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            <div className="w-full">
              <label
                htmlFor="POST-message"
                className="block text-sm font-medium"
              >
                Message
              </label>
              <textarea
                id="POST-message"
                name="message"
                rows={4}
                className="w-full border-2 border-gray-300 text-deluxe-black rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
              />
              {messageError && (
                <p className="text-red-500 text-sm mt-1">{messageError}</p>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-2 font-bold bg-ooh-yeah-pink text-white rounded-lg shadow-md hover:bg-ooh-yeah-pink-700 transition-colors"
            >
              SEND
            </button>

            {formSuccess && (
              <p
                className={`text-sm mt-2 ${
                  formSuccess.startsWith("Form")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formSuccess}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }
);

Contact.displayName = "Contact";

export default Contact;
