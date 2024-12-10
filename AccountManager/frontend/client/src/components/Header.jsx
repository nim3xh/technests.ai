import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signoutSuccess } from "../redux/user/userSlice";
import LogoNew from "../assets/logonew.jpg";
import { FaMoon, FaSun } from "react-icons/fa";
import { toggleTheme } from "../redux/theme/themeSlice";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function Header() {
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

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
    <Navbar className="border-b-2 sticky top-0 z-50" fluid rounded>
      {/* Logo Section */}
      <div className="flex items-center">
        <Link
          to="/dashboard?tab=dash"
          className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
        >
          <img
            src={LogoNew}
            alt="logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg"
          />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 flex-wrap md:order-2">
        {/* Theme Toggle Button */}
        <Button
          className="w-8 h-8 sm:w-12 sm:h-10 hidden sm:block"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>

        {/* User Authentication Section */}
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar alt="user" img={currentUser.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">
                @{currentUser.user.FirstName + " " + currentUser.user.LastName}
              </span>
              <span className="block text-xs font-medium truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Link to={"/dashboard?tab=profile"}>
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientMonochrome="teal">Sign In</Button>
          </Link>
        )}
      </div>
    </Navbar>
  );
}
