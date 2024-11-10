import {
    Alert,
    Button,
    TextInput,
    Spinner,
    Label,
    Select,
    Breadcrumb,
    Checkbox,
  } from "flowbite-react";
  import { React, useState, useRef, useEffect } from "react";
  import { useSelector } from "react-redux";
  import "react-circular-progressbar/dist/styles.css";
  import { useDispatch } from "react-redux";
  import { HiHome } from "react-icons/hi";
  import { Link } from "react-router-dom";
  import { motion, AnimatePresence } from "framer-motion";

  const BaseURL = import.meta.env.VITE_BASE_URL;
  
  export default function DashUserPasswordChange() {
    const { currentUser, error, loading } = useSelector((state) => state.user);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
  
    const [formData, setFormData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
  
    const [createLoding, setCreateLoding] = useState(null);
  
    const dispatch = useDispatch();
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setUpdateUserError(null);
      setUpdateUserSuccess(null);
  
      const { email, oldPassword, newPassword, confirmnewpassword } = formData;
  
      if (currentUser.user.email !== email) {
        setUpdateUserError("Your email is incorrect. Please try again.");
        return;
      }
  
      // Validation logic
      if (!email || !oldPassword || !newPassword || !confirmnewpassword) {
        setUpdateUserError("All fields are required.");
        return;
      }
  
      if (newPassword !== confirmnewpassword) {
        setUpdateUserError("New password and confirm password do not match.");
        return;
      }
  
      if (newPassword.length < 8) {
        setUpdateUserError("New password must be at least 8 characters long.");
        return;
      }
  
      if (passwordStrength < 4) {
        setUpdateUserError("Password is too weak. Please follow the guidelines.");
        return;
      }
  
      console.log(formData);
  
      try {
        setCreateLoding(true);
        const res = await fetch(`${BaseURL}auth/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          setCreateLoding(false);
          setUpdateUserError(data.message);
        } else {
          setCreateLoding(false);
          setUpdateUserSuccess("Password change successfully.");
        }
      } catch (error) {
        setCreateLoding(false);
        setUpdateUserError(error.message);
      }
    };
  
    //const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
  
    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };
  
    const handlePasswordChange = (e) => {
      const password = e.target.value;
      setNewPassword(password);
      evaluatePasswordStrength(password);
    };
  
    const handleCombinedChange = (e) => {
      handlePasswordChange(e);
      handleChange(e);
    };
  
    const evaluatePasswordStrength = (password) => {
      let strength = 0;
  
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/\d/.test(password)) strength += 1;
      if (/[@$!%*?&]/.test(password)) strength += 1;
  
      setPasswordStrength(strength);
    };
  
    const getStrengthColor = () => {
      switch (passwordStrength) {
        case 1:
          return "bg-red-500";
        case 2:
          return "bg-yellow-500";
        case 3:
          return "bg-blue-500";
        case 4:
          return "bg-green-500";
        default:
          return "bg-gray-300";
      }
    };
  
    const getStrengthWidth = () => {
      switch (passwordStrength) {
        case 1:
          return "w-1/4";
        case 2:
          return "w-2/4";
        case 3:
          return "w-3/4";
        case 4:
          return "w-full";
        default:
          return "w-0";
      }
    };
  
    return (
      <div className="p-3 w-full">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Breadcrumb aria-label="Default breadcrumb example">
              <Link to="/dashboard?tab=dash">
                <Breadcrumb.Item href="" icon={HiHome}>
                  Home
                </Breadcrumb.Item>
              </Link>
              <Breadcrumb.Item>Password</Breadcrumb.Item>
            </Breadcrumb>
  
            <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
              Change Password
            </h1>
  
            <div className="flex gap-2">
              <div className="max-w-lg mx-auto p-3 w-2/5">
                <h1 className="mt-3 mb-3 text-left font-semibold text-xl ">
                  Change Password
                </h1>
  
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {updateUserError && (
                    <Alert color="failure" className="mt-5">
                      {updateUserError}
                    </Alert>
                  )}
  
                  {updateUserSuccess && (
                    <Alert color="success" className="mt-5">
                      {updateUserSuccess}
                    </Alert>
                  )}
  
                  <div>
                    <div>
                      <div className="mb-2 block">
                        <Label value="Your Email" />
                      </div>
                      <TextInput
                        id="email"
                        placeholder="kasu@gmail.com"
                        required
                        shadow
                        onChange={handleChange}
                      />
                    </div>
  
                    <div className="mt-4">
                      <div className="mb-2 block">
                        <Label value="Old Password" />
                      </div>
                      <TextInput
                        id="oldPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="*********"
                        required
                        shadow
                        onChange={handleChange}
                      />
                    </div>
  
                    <div className="mt-4">
                      <div className="mb-2 block">
                        <Label value="New Password" />
                      </div>
                      <TextInput
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="*********"
                        required
                        shadow
                        onChange={handleCombinedChange}
                      />
                    </div>
  
                    <div className="mt-4">
                      <div className="mb-2 block">
                        <Label value="Confirm New Password" />
                      </div>
                      <TextInput
                        id="confirmnewpassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="*********"
                        required
                        shadow
                        onChange={handleCombinedChange}
                      />
  
                      <div className="mt-4 mb-4 h-1 w-full bg-gray-300 rounded">
                        <div
                          className={`h-full ${getStrengthColor()} ${getStrengthWidth()} rounded`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Your password must be at least 8 characters long, include
                        at least one uppercase letter, one number, and one special
                        character.
                      </p>
                    </div>
  
                    <div className="mt-2">
                      <Checkbox
                        id="showPassword"
                        checked={showPassword}
                        onChange={handleTogglePassword}
                        color="blue"
                      />
                      <Label
                        htmlFor="showPassword"
                        className="ml-2 text-sm font-medium text-gray-700"
                      >
                        Show Password
                      </Label>
                    </div>
                  </div>
  
                  <Button  gradientDuoTone="greenToBlue" type="submit">
                    {createLoding ? (
                      <>
                        <Spinner size="sm" />
                        <span className="pl-3">Updating...</span>
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
  