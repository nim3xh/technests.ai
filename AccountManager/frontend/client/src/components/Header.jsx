import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
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
    <Navbar
      className="border-b-2 sticky top-0 z-50 justify-between"
      fluid
      rounded
    >
      {currentUser && (
        <>
          {currentUser.user.role !== "user" && (
              <Link
                to="/dashboard?tab=dash"
                className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
              >
              < img src={LogoNew} alt="logo" className="w-10 h-10 rounded-lg" />
              </Link>
        )}
        {currentUser.user.role === "user" && (
            <Link
              to="/dashboard?tab=dashUser"
              className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
            >
            < img src={LogoNew} alt="logo" className="w-10 h-10 rounded-lg" />
            </Link>
        )}
        </>
      )}

      {!currentUser && (
        <Link to="/" className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white">
          < img src={LogoNew} alt="logo" className="w-10 h-10 rounded-lg" />
          </Link>
        )}
      
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
                <br></br>
                <i>{currentUser.user.email }</i>
              </span>
              <span className="block text-sm font-medium truncate">
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
