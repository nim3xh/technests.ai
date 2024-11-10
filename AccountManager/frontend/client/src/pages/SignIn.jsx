import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";


const BaseURL = import.meta.env.VITE_BASE_URL;

export default function SignIn() {
  const {loading, error: errorMessage} = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
   const handleChange = (e) => {
     const { id, value } = e.target;
     if (id === "email") setEmail(value.trim());
     else if (id === "password") setPassword(value.trim());
   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return dispatch(signInFailure("Please fill in all fields"));
    }

    dispatch(signInStart());
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
        // Handle successful sign-in
        dispatch(signInSuccess(data)); // Update the user state with the fetched user data
        localStorage.setItem("access", data.token);
        if (data.user.role === "admin") navigate("/dashboard?tab=dash"); // Navigate to the users tab if the user is an admin
        else if (data.user.role === "user"){
          navigate("/dashboard?tab=dashUser"); // Navigate to the user dashboard if the user is a regular user
        }
        else if (data.user.role === "super-user") navigate("/dashboard?tab=dashSuperUser"); // Navigate to the superuser dashboard if the user is a superuser
      } else {
        // Handle errors (e.g., invalid credentials)
        // dispatch(signInFailure(data.message || "Login failed"));
      }
    } catch (error) {
        dispatch(signInFailure("An error occurred. Please try again."));
        console.error("Error during login:", error);
    } finally {
        //setLoading(false); // Stop loading when the request is finished
        dispatch(signInFailure(null)); // Clear any previous error messages
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-lg text-white">
              technests's
            </span>
            <br />
            Account Manager
          </Link>
          <p className="text-sm mt-5">
            Welcome to technests's Account Manager.
          </p>
        </div>
        {/* right */}

        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your password" />
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>
            <Button gradientMonochrome="teal" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
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
    </div>
  );
}
