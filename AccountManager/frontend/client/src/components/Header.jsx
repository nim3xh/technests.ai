import { Navbar, TextInput,Button } from "flowbite-react";
import React from "react";
import { Link } from "react-router-dom";
import { FaMoon } from "react-icons/fa";

export default function Header() {
  return (
    <Navbar
      className="border-b-2 sticky top-0 z-50 justify-between"
      fluid
      rounded
    >
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <span className="px-2 py-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-lg text-white">
          technests.ai
        </span>
      </Link>
      <div className="flex gap-2 md:order-2">
        <Button className="w-12 h-10 hidden sm:inline" color="gray" pill>
          <FaMoon />
        </Button>
        <Button gradientMonochrome="teal">Sign In</Button>
      </div>
    </Navbar>
  );
}
