import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiOutlineUserGroup,
  HiChartPie,
  HiBriefcase,
} from "react-icons/hi";
import { IoMdAnalytics } from "react-icons/io";
import { FaUserCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { MdPassword } from "react-icons/md";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashSidebar() {
    const location = useLocation();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const [tab, setTab] = useState("");

    useEffect(() => {
      const urlParams = new URLSearchParams(location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl) {
        setTab(tabFromUrl);
      }
    }, [location.search]);

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
      <Sidebar className="w-full md:w-56">
        <Sidebar.Items>
          <Sidebar.ItemGroup className="flex flex-col gap-1">
            {currentUser.user.role !== "user" && (
              <>
              <Link to="/dashboard?tab=dash">
                <Sidebar.Item
                  active={tab === "dash" || !tab}
                  icon={HiChartPie}
                  as="div"
                >
                  Dashboard
                </Sidebar.Item>
              </Link>
              </>
            )}
            {currentUser.user.role === "user" && (
              <Link to="/dashboard?tab=dashUser">
                <Sidebar.Item
                  active={tab === "dashUser"}
                  icon={HiChartPie}
                  as="div"
                >
                  Dashboard
                </Sidebar.Item>
              </Link>
            )}
            
            <Sidebar.Collapse icon={HiUser} label="Profile">
              <Link to="/dashboard?tab=profile">
                <Sidebar.Item
                  active={tab === "profile"}
                  icon={HiUser}
                  label={
                    currentUser.user.role === "admin"
                      ? "Admin"
                      : currentUser.user.role === "super-user"
                      ? "Super User"
                      : "User"
                  }
                  labelColor="dark"
                  as="div"
                >
                  Profile
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=password-change">
                  <Sidebar.Item
                    className="mt-2 mb-2"
                    active={tab === "password-change"}
                    icon={MdPassword}
                    as="div"
                  >
                    Change Password
                  </Sidebar.Item>
                </Link>

            </Sidebar.Collapse>
            
             {currentUser.user.role !== "user" && (
              <>
              <Link to="/dashboard?tab=accountDetails">
                  <Sidebar.Item
                    active={tab === "accountDetails"}
                    icon={IoMdAnalytics}
                    as="div"
                  >
                   Filter Account Details
                  </Sidebar.Item>
                </Link>
                <Link to="/dashboard?tab=users">
                  <Sidebar.Item
                    active={tab === "users"}
                    icon={HiOutlineUserGroup}
                    as="div"
                  >
                    Add/ Edit User
                  </Sidebar.Item>
                </Link>
                <Link to="/dashboard?tab=trades">
                  <Sidebar.Item
                    active={tab === "trades"}
                    icon={HiBriefcase}
                    as="div"
                  >
                    Add/ Edit Trade
                  </Sidebar.Item>
                </Link>
              </>
            )}
            {/* {currentUser.user.role !== "user" && (
              <>
                <Link to="/dashboard?tab=accOwners">
                  <Sidebar.Item
                    active={tab === "accOwners"}
                    icon={FaUserCheck}
                    as="div"
                  >
                    Account Owners
                  </Sidebar.Item>
                </Link>

                
              </>
            )} */}
            {currentUser.user.role !== 'user' &&(
              <Link to="/dashboard?tab=accountDetailsHistory">
                <Sidebar.Item
                  active={tab === "accountDetailsHistory"}
                  icon={HiBriefcase}
                  as="div"
                >
                  Past Account Details
                </Sidebar.Item>
              </Link>
            )}
            <Sidebar.Item
              icon={HiArrowSmRight}
              className="cursor-pointer"
              onClick={handleSignout}
            >
              Sign Out
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    );
}