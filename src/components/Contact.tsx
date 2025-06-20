import type React from "react";
import { forwardRef, useRef, useState } from "react";

interface ContactProps {
  id?: string;
  goBackToHome?: () => void;
}

const Contact = forwardRef<HTMLDivElement, ContactProps>(
  ({ id, goBackToHome }, ref) => {
    const form = useRef<HTMLFormElement | null>(null);
    const [nameError, setNameError] = useState("");
    const [phoneError, setPhoneError] = useState("")
    const [emailError, setEmailError] = useState("");
    const [messageError, setmessageError] = useState("");
    const [formSuccess, setformSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
      let isValid = true;

      if (!form.current?.user_name.value) {
        setNameError("Name required");
        isValid = false;
        setTimeout(() => setNameError(""), 3000);
      } else {
        setNameError("");
      }

      const phone = form.current?.user_phone.value;
      if (!phone) {
        setPhoneError("Phone required");
        isValid = false;
        setTimeout(() => setPhoneError(""), 3000);
      } else if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
        setPhoneError("Invalid phone number");
        isValid = false;
        setTimeout(() => setPhoneError(""), 3000);
      } else {
        setPhoneError("");
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

    const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm() || !form.current) return;

      setIsLoading(true);

      const payload = {
        name: form.current.user_name.value,
        phone: form.current.user_phone.value,
        email: form.current.user_email.value,
        message: form.current.message.value,
      };

      try {
        const response = await fetch(
          "https://sendcontactemail-5gaafu43za-uc.a.run.app",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const resultText = await response.text();

        if (response.ok) {
          setformSuccess("Form sent successfully");
          form.current.reset();
        } else {
          console.error("Error:", resultText);
          setformSuccess("Error sending form. Try again.");
        }
      } catch (error) {
        console.error("Request failed:", error);
        setformSuccess("Error sending form. Try again.");
      } finally {
        setIsLoading(false);
        setTimeout(() => setformSuccess(null), 3000);
      }
    };

    return (
      <div
        id={id}
        ref={ref}
        className="h-auto p-6 bg-deluxe-black text-white md:p-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 animate-fadeIn"
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
          <img
            src="https://firebasestorage.googleapis.com/v0/b/colmap-9f519.firebasestorage.app/o/settings%2Fconsult-image.jpg?alt=media"
            alt="ooh-yeah"
            className="rounded-md object-cover"
          />
        </div>
        <div className="space-y-6 flex flex-col justify-center w-full h-full self-stretch items-center">
          <h1 className="text-3xl font-bold">Request a Consultation</h1>
          <h2 className="text-xl font-light">We'd love to hear from you!</h2>

          <form
            ref={form}
            onSubmit={sendEmail}
            className="flex flex-col items-center w-full max-w-md space-y-3"
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
              {/* Reserved space for error message */}
              <div className="h-5 mt-1">
                {nameError && (
                  <p className="text-red-500 text-sm animate-fadeIn">
                    {nameError}
                  </p>
                )}
              </div>
            </div>

            <div className="w-full">
              <label htmlFor="POST-phone" className="block text-sm font-medium">
                Phone
              </label>
              <input
                id="POST-phone"
                type="text"
                name="user_phone"
                className="w-full border-2 border-gray-300 text-deluxe-black rounded-lg px-4 py-2 mt-1 focus:border-ooh-yeah-pink focus:outline-none transition-colors"
              />
              {/* Reserved space for error message */}
              <div className="h-5 mt-1">
                {phoneError && (
                  <p className="text-red-500 text-sm animate-fadeIn">
                    {phoneError}
                  </p>
                )}
              </div>
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
              {/* Reserved space for error message */}
              <div className="h-5 mt-1">
                {emailError && (
                  <p className="text-red-500 text-sm animate-fadeIn">
                    {emailError}
                  </p>
                )}
              </div>
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
              {/* Reserved space for error message */}
              <div className="h-5 mt-1">
                {messageError && (
                  <p className="text-red-500 text-sm animate-fadeIn">
                    {messageError}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 font-bold bg-ooh-yeah-pink text-white rounded-lg shadow-md transition-colors ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-ooh-yeah-pink-700"
              }`}
            >
              {isLoading ? "SENDING..." : "SEND"}
            </button>

            <div className="h-5 text-center">
              {formSuccess && (
                <p
                  className={`text-sm animate-fadeIn ${
                    formSuccess.startsWith("Form")
                      ? "text-ooh-yeah-pink"
                      : "text-red-500"
                  }`}
                >
                  {formSuccess}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }
);

Contact.displayName = "Contact";

export default Contact;
