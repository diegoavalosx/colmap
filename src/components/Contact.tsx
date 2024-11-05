import React, { forwardRef, useRef, useState} from "react";
import emailjs from '@emailjs/browser'

const Contact = forwardRef<HTMLDivElement>((_, ref) => {
  
  const form = useRef<HTMLFormElement | null>(null);

  // Error states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [messageError, setmessageError] = useState("");
  const [formSuccess, setformSuccess] = useState<string | null>(null);

  const validateForm = () => {
    let isValid = true;

    // Name input validate
    if(!form.current?.user_name.value){
      setNameError("Name required");
      isValid = false;
      setTimeout(() => setNameError(""), 3000); 
    } else {
      setNameError("")
    }

    // email input validate
    const email = form.current?.user_email.value;
    if(!email) {
      setEmailError("Email required");
      isValid = false;
      setTimeout(() => setEmailError(""), 3000); 
    } else if(!/\S+@\S+\.\S+/.test(email)){
      setEmailError("Invalid email");
      isValid = false;
      
    } else{
      setEmailError("");
    }

    // message input validate
    if(!form.current?.message.value){
      setmessageError("Message required");
      isValid = false;
      setTimeout(() => setmessageError(""), 3000); 
    } else {
      setmessageError("");
    }
    return isValid;
  }
  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(validateForm()){
      emailjs
      .sendForm('service_8lw0vae', 'template_oh3nnzt', form.current!, {
        publicKey: 'o1R8SWpVH1-dSQA6e',
      })
      .then(
        (result) => {
          console.log(result.text);
          setformSuccess("Form sent successfully")
          form.current?.reset();

          // Hide success message
          setTimeout(() => {
            setformSuccess(null)
          }, 3000);
          
        },
        (error) => {
          console.log('FAILED...', error.text);
          setformSuccess("Error sending form. Try again.");
          // Hide error message
          setTimeout(() => {
            setformSuccess(null)
          }, 3000);
        }
      );
    } 
  };


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
          ref={form}
          onSubmit={sendEmail}
        >
          <label htmlFor="POST-name">Name</label>
          <input
            className="border-solid border-2 rounded h-10 w-56"
            id="POST-name"
            type="text"
            name="user_name"
          /> 
          {nameError && <p className="text-red-500">{nameError}</p>}
          <label htmlFor="POST-email">Email</label>
          <input
            className="border-solid border-2 rounded h-10 w-56"
            id="POST-email"
            type="text"
            name="user_email"
          />
          {emailError && <p className="text-red-500">{emailError}</p>}

          <label htmlFor="POST-message">Message</label>
          <input
            className="border-solid border-2 rounded h-10 w-56"
            id="POST-message"
            type="text"
            name="message"
          />
          {messageError && <p className="text-red-500">{messageError}</p>}

          <button className="hover:text-ooh-yeah-pink" type="submit">
            SEND
          </button>
          {formSuccess && (
            <p className={formSuccess.startsWith("Form") ? "text-green-500" : "text-red-500"}>{formSuccess}</p>
          )}
        </form>
      </div>
    </div>
  );
});

export default Contact;
