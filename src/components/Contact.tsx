import type React from "react";
import { forwardRef, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

interface ContactProps {
  id?: string;
}

const Contact = forwardRef<HTMLDivElement, ContactProps>(({ id }, ref) => {
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
      className="h-screen bg-deluxe-black text-deluxe-gray p-8 md:p-16 flex flex-col items-center justify-center space-y-8 animate-fadeIn"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Send us a message</h1>
        <h2 className="text-xl font-light">We'd love to hear from you!</h2>
      </div>
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
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
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
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>
        <div className="w-full">
          <label htmlFor="POST-message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="POST-message"
            name="message"
            rows={4}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
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
              formSuccess.startsWith("Form") ? "text-green-500" : "text-red-500"
            }`}
          >
            {formSuccess}
          </p>
        )}
      </form>
    </div>
  );
});

Contact.displayName = "Contact";

export default Contact;
