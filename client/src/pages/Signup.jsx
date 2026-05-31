import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Signup() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleSignup =
    async (e) => {
      e.preventDefault();

      try {
        await axios.post(
          `${API_URL}/auth/signup`,
          {
            name,
            email,
            password,
          }
        );

        alert(
          "Signup Successful"
        );
        window.location.href = "/login";
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Signup Failed"
        );
      }
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form
        onSubmit={
          handleSignup
        }
        className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold">
          Signup
        </h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
          className="mb-4 w-full rounded border p-3"
          required
        />

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
          className="w-full rounded bg-green-600 p-3 text-white"
        >
          Signup
        </button>
        <p className="mt-4 text-center">
  Already have an account?{" "}
  <a
    href="/login"
    className="text-blue-600"
  >
    Login
  </a>
</p>
      </form>
    </div>
  );
}

export default Signup;