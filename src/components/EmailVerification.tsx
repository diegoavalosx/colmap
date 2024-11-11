import {useState} from 'react';
import {sendEmailVerification} from 'firebase/auth';
import authPromise from "../firebase-config";

const EmailVerification: React.FC = () => {

  const [verificationMessage, setVerificationMessage] = useState("");
  const resendEmailConfirmation = async () =>{
    try{
      //
      const { auth } = await authPromise;
      const user = auth.currentUser;

      if(user){
        console.log(user)
        await sendEmailVerification(user);
        setVerificationMessage("Verification email has been resent. Please check your inbox.");
      } else {
        setVerificationMessage("No user is currently signed in.")
      }
    } catch(error){
      console.error("Error sendin email verification:", error);
      setVerificationMessage("An error occurred while resendin the verification email. Please try again later.")
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-black"> 
          Help with your Account Verification
        </h2>
        <p className="mb-6 text-xl">If you still do not receive a confirmation email, click the next button.</p>
        <button 
          onClick={resendEmailConfirmation}
          className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors">
          Resend Verification Email
        </button>
        {verificationMessage && (
          <p className={`mt-4 text-center ${verificationMessage.includes("error") ? "text-red-600" : "text-green-600"}`}></p>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
