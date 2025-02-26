import { useState } from "react";
import { useAuth } from "./useAuth";

const EmailVerification: React.FC = () => {
  const { resendVerificationEmail } = useAuth();
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );

  const handleSendEmail = async () => {
    try {
      await resendVerificationEmail();
      setVerificationMessage(
        "Verification email has been sent. Please check your inbox."
      );
    } catch (error) {
      console.error("Error sending email verification:", error);
      setVerificationMessage(
        "An error occurred while sending the verification email. Please try again later."
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg h-80">
        {verificationMessage ? (
          <p className="mt-4 text-center text-black text-xl font-semibold">
            {verificationMessage}
          </p>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-center text-black">
              Help with your Account Verification
            </h2>
            <p className="mb-6 text-xl">
              Click the button below to verify your email
            </p>
            <button
              type="button"
              onClick={handleSendEmail}
              className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors"
            >
              Send Verification Email
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
