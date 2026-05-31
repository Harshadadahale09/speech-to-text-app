import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = async (
    e
  ) => {
    e.preventDefault();

    try {
      const res =
        await axios.post(
          `${API_URL}/auth/login`,
          {
            email,
            password,
          }
        );
        console.log(res.data);

      localStorage.setItem(
        "token",
        res.data.token
      );
      localStorage.setItem(
  "user",
  JSON.stringify(
    res.data.user
  )
);

      alert(
        "Login Successful"
      );
      window.location.href = "/";
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          "Login Failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={
          handleLogin
        }
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="mb-4 w-full rounded border p-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="mb-4 w-full rounded border p-3"
          required
        />

        <button
          type="submit"
          className="w-full rounded bg-blue-600 p-3 text-white"
        >
          Login
        </button>
        <p className="mt-4 text-center">
  Don't have an account?{" "}
  <a
    href="/signup"
    className="text-blue-600"
  >
    Signup
  </a>
</p>
      </form>
    </div>
  );
}

export default Login;