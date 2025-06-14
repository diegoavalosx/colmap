import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
interface LogInFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, user, authStatus, authError, clearAuthError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LogInFormData>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user?.emailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        clearAuthError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authError, clearAuthError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result === "emailNotVerified") {
      navigate("/email-verification");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white md:bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-none md:shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-black">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="text-left">
          <label
            htmlFor="email"
            className="block text-sm mb-2 font-bold text-gray-700"
          >
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
            placeholder="you@example.com"
            required
          />

          <label
            htmlFor="password"
            className="block text-sm mb-2 font-bold text-gray-700"
          >
            Password:
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {authError && (
            <p className="text-red-500 mb-4 text-center">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors"
            disabled={authStatus === "loading"}
          >
            {authStatus === "loading" ? "Loading..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
