import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Handle error locally
  const navigate = useNavigate();

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true); // Set loading when the submit starts
    setErrorMessage(""); // Reset the error message before a new submission

    try {
      const response = await fetch(`${BaseURL}auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are included in requests
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/dashboard"); // Navigate to the dashboard after successful login
      } else {
        // Handle errors (e.g., invalid credentials)
        setErrorMessage(data.message || "Login failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Error during login:", error);
    } finally {
      setLoading(false); // Stop loading when the request is finished
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "username") setEmail(value.trim());
    else if (id === "password") setPassword(value.trim());
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Toggle visibility on click
  };

  return (
    <>
      <div className="min-h-screen mt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen mt-20"
        >
          <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-10">
            {/* Left side */}
            <div className="flex-1">
              <p className="text-sm mt-5">
                SABARAGAMU ATHSALU, a government business, specializes in
                selling finishing textiles.
              </p>
            </div>

            {/* Right side */}
            <div className="flex-1">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold dark:text-white">Log In</h3>
                <div>
                  <Label value="Your User Name" />
                  <TextInput
                    type="text"
                    placeholder="user name"
                    id="username"
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center">
                  <div className="flex-grow">
                    <Label value="Your Password" />
                    <TextInput
                      type={passwordVisible ? "text" : "password"} // Toggle based on visibility state
                      placeholder="password"
                      id="password"
                      onChange={handleChange}
                    />
                    <div className="flex items-center mt-2">
                      <button
                        type="button"
                        className="mr-2" // Margin for eye button
                        onClick={togglePasswordVisibility} // Toggle on click
                        aria-label="Toggle password visibility"
                      >
                        {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                      </button>

                      <Label value="Show Password" />
                    </div>
                  </div>
                </div>

                <Button color="blue" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Loading...</span>
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>

              {errorMessage && (
                <Alert className="mt-5" color="failure">
                  {errorMessage}
                </Alert>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
