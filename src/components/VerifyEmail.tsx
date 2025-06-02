import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import firebaseInstancesPromise from "../firebase-config";
import { applyActionCode } from "firebase/auth";

const VerifyEmail = () => {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      firebaseInstancesPromise
        .then(({ auth }) => applyActionCode(auth, oobCode))
        .then(() => {
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        })
        .catch((error) => {
          console.error("Email verification error:", error);
          setStatus("error");
        });
    } else {
      setStatus("error");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg h-80">
        {status === "verifying" && (
          <p className="text-xl text-center text-black font-medium">
            Verifying your email...
          </p>
        )}
        {status === "success" && (
          <p className="text-xl text-center text-green-600 font-semibold">
            Your email has been verified! Redirecting...
          </p>
        )}
        {status === "error" && (
          <p className="text-xl text-center text-red-600 font-semibold">
            Invalid or expired verification link.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
