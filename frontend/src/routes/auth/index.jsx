import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import axios from "../../../lib/axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const passRef = useRef();
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["access_token"]);

  useEffect(() => {
    if (cookies.access_token) navigate("/");
  }, []);

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/login", {
        password: passRef.current.value,
      });

      passRef.current.value = "";

      if (response.status === 200) {
        console.log("Logged successfully.");

        setCookie("access_token", response.data.access_token);

        navigate("/");
      } else {
        console.error("Login failed with status code: ", response.status);
      }
    } catch (error) {
      console.error("Error while Logging in: ", error);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className=" p-10 bg-white rounded-lg border drop-shadow-xl">
        <h2 className=" text-3xl font-bold capitalize text-center mb-4">
          Welcome back!
        </h2>
        <form className=" w-64" onSubmit={submitHandler}>
          <div className="inline-flex mb-4 w-full border-b-2 border-black">
            <input
              ref={passRef}
              type={showPassword ? "text" : "password"}
              className="px-3 py-2 w-full outline-none "
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FontAwesomeIcon icon={faEyeSlash} size="lg" />
              ) : (
                <FontAwesomeIcon icon={faEye} size="lg" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-gray-950 rounded-md px-6 py-3 text-white font-semibold inline-flex justify-center"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
