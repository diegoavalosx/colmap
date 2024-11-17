import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const EmailVerification: React.FC = () => {
  const { resendVerificationEmail } = useAuth();
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      setVerificationMessage(
        "Verification email has been resent. Please check your inbox."
      );
    } catch (error) {
      console.error("Error resending email verification:", error);
      setVerificationMessage(
        "An error occurred while resending the verification email. Please try again later."
      );
    }
  };

  useEffect(() => {
    if (verificationMessage) {
      const timer = setTimeout(() => {
        setVerificationMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [verificationMessage]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-black">
          Help with your Account Verification
        </h2>
        <p className="mb-6 text-xl">
          If you still do not receive a confirmation email, click the next
          button.
        </p>
        <button
          type="button"
          onClick={handleResendEmail}
          className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors"
        >
          Resend Verification Email
        </button>
        {verificationMessage && (
          <p
            className={`mt-4 text-center text-black ${
              verificationMessage.includes("Error")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {verificationMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
