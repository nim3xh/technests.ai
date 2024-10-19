import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Breadcrumb,
  Button,
  Modal,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { HiHome } from "react-icons/hi";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState(currentUser.user.FirstName);
  const [lastName, setLastName] = useState(currentUser.user.LastName);
  const [apexAccountNumber, setApexAccountNumber] = useState(
    currentUser.user.ApexAccountNumber
  );
  const [email, setEmail] = useState(currentUser.user.email);
  const [role, setRole] = useState(currentUser.user.role);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = {
      firstName,
      lastName,
      apexAccountNumber,
      email,
      password,
      role,
    };

    const token = currentUser.token; // Get the token from the currentUser object
    const headers = {
      Authorization: `Bearer ${token}`, // Pass token in the Authorization header
    };

    console.log(userData);
    try {
      const response = await axios.patch(
        `${BaseURL}userCredentials/${currentUser.user.email}`,
        userData,
        { headers }
      );

      // Dispatch action to update user state if necessary
      console.log("Profile updated successfully", response.data);
      setIsLoading(false);
      setErrorMessage(null);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.response?.data?.message || "Something went wrong");
      console.error("Error updating profile:", error);
    }
  };
  

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Profile</Breadcrumb.Item>
      </Breadcrumb>
      <div className="max-w-lg mx-auto p-3 w-full">
        <h1 className="my-7 text-center font-semibold text-3xl">Profile</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full">
            <img
              src={currentUser.profilePicture}
              alt="user"
              className="rounded-full w-full h-full object-cover border-8 border-[lightgray]"
            />
          </div>
          <TextInput
            type="text"
            id="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextInput
            type="text"
            id="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextInput
            type="text"
            id="ApexAccountNumber"
            placeholder="Account Number"
            value={apexAccountNumber}
            onChange={(e) => setApexAccountNumber(e.target.value)}
          />
          <TextInput
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            type="password"
            id="password"
            placeholder="New Password (Leave empty if not changing)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <Button
            type="submit"
            gradientDuoTone="greenToBlue"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
}
