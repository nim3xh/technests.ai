import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signoutSuccess } from "../redux/user/userSlice";
import LogoNew from "../assets/logonew.jpg";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { toggleTheme } from "../redux/theme/themeSlice";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function Header() {
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const path = useLocation().pathname;

  const [isOpen, setIsOpen] = useState(false); // State to control mobile menu visibility

  const handleSignout = async () => {
    try {
      const res = await fetch(`${BaseURL}auth/signout`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Navbar className="border-b-2 sticky top-0 z-50 justify-between" fluid rounded>
      <div className="flex items-center">
        {/* Logo */}
        {currentUser && currentUser.user.role !== "user" && (
          <Link to="/dashboard?tab=dash" className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
            <img src={LogoNew} alt="logo" className="w-10 h-10 rounded-lg" />
          </Link>
        )}
        {currentUser && currentUser.user.role === "user" && (
          <Link to="/dashboard?tab=dashUser" className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
            <img src={LogoNew} alt="logo" className="w-10 h-10 rounded-lg" />
          </Link>
        )}
        {!currentUser && (
          <Link to="/" className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
            <img src={LogoNew} alt="logo" className="w-10 h-10 rounded-lg" />
          </Link>
        )}
      </div>

      {/* Theme Toggle and Profile Dropdown */}
      <div className="flex gap-2 md:order-2">
        <Button
          className="w-12 h-10 hidden sm:inline"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>

        {currentUser ? (
          <Dropdown arrowIcon={false} inline label={<Avatar alt="user" img={currentUser.profilePicture} rounded />}>
            <Dropdown.Header>
              <span className="block text-sm">
                @{currentUser.user.FirstName} {currentUser.user.LastName}
                <br />
                <i>{currentUser.user.email}</i>
              </span>
              <span className="block text-sm font-medium truncate">{currentUser.email}</span>
            </Dropdown.Header>
            <Link to="/dashboard?tab=profile">
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <></> // No need to show anything here, the button will be inside the collapsed menu.
        )}
        
        {/* Sign In Button for Large Screens */}
        {!currentUser && (
          <Link to="/sign-in" className="hidden sm:inline-block ml-4">
            <Button gradientMonochrome="teal">Sign In</Button>
          </Link>
        )}
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="flex md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 w-10 h-10 text-gray-500 hover:text-gray-800 dark:text-white dark:hover:text-gray-400"
        >
          {isOpen ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaBars className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Collapse Navbar Links for Mobile */}
      <Navbar.Collapse className={`${isOpen ? "block" : "hidden"} md:flex justify-center items-center`}>
        <Navbar.Link active={path === "/"} as={"div"}>
          <a href="#home" className="text-gray-900 dark:text-white hover:text-teal-500">Home</a>
        </Navbar.Link>
        <Navbar.Link active={path === "/about-us"} as={"div"}>
          <a href="#about-us" className="text-gray-900 dark:text-white hover:text-teal-500">About</a>
        </Navbar.Link>
        <Navbar.Link active={path === "/services"} as={"div"}>
          <a href="#services" className="text-gray-900 dark:text-white hover:text-teal-500">Services</a>
        </Navbar.Link>
        <Navbar.Link active={path === "/contact-us"} as={"div"}>
          <a href="#contact-us" className="text-gray-900 dark:text-white hover:text-teal-500">Contact Us</a>
        </Navbar.Link>

        {/* Add Sign In Button to Collapse (for mobile view) */}
        {!currentUser && (
          <Link to="/sign-in" className="block md:hidden">
            <Button gradientMonochrome="teal" className="w-full">
              Sign In
            </Button>
          </Link>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
