import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

interface LogInFormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState<LogInFormData>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <div className="flex h-full w-full justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-4 max-w-md mx-auto"
      >
        <label htmlFor="email" className="mb-2 font-semibold">
          Email:
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mb-4 p-2 border border-gray-300 rounded"
          required
        />

        <label htmlFor="password" className="mb-2 font-semibold">
          Password:
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleInputChange}
          className="mb-4 p-2 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
