import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { Link, useNavigate } from "react-router-dom";
interface LogInFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, user, authStatus, authError, clearAuthError } = useAuth();
  const [formData, setFormData] = useState<LogInFormData>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
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

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
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
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 mb-4 text-black placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent"
            placeholder="••••••••"
            required
          />
          {authError && <p className="text-red-500 mb-4">{authError}</p>}

          <button
            type="submit"
            className="w-full py-2 mt-4 font-semibold text-white bg-ooh-yeah-pink rounded-lg hover:bg-pink-600 transition-colors"
            disabled={authStatus === "loading"}
          >
            {authStatus === "loading" ? "Loading..." : "Log In"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium text-pink hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
