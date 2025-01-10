import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiOutlineUserGroup,
  HiChartPie,
  HiBriefcase,
} from "react-icons/hi";
import { IoMdAnalytics } from "react-icons/io";
import { FaHistory } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { MdPassword } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { TbHeartRateMonitor } from "react-icons/tb";
import { IoGitCompare } from "react-icons/io5";
import { MdVideoLibrary } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";

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
                  Summary
                </Sidebar.Item>
              </Link>
              </>
            )}
            {currentUser.user.role === "user" && (
              <>
                <Link to="/dashboard?tab=dashUser">
                  <Sidebar.Item
                    active={tab === "dashUser"}
                    icon={HiChartPie}
                    as="div"
                  >
                    Summary
                  </Sidebar.Item>
                </Link>
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
                <Link to="/dashboard?tab=tradeMonitorUser">
                  <Sidebar.Item
                    active={tab === "tradeMonitor"}
                    icon={TbHeartRateMonitor}
                    as="div"
                  >
                    Trade Monitor
                  </Sidebar.Item>
                </Link>
                <Link to="/dashboard?tab=accountDetailsUser">
                  <Sidebar.Item
                    active={tab === "accountDetails"}
                    icon={IoMdAnalytics}
                    as="div"
                  >
                   Account Details
                  </Sidebar.Item>
                </Link>
                <Link	to='/dashboard?tab=referFriend'>
                  <Sidebar.Item
                    active={tab === "referFriend"}
                    icon={FaUserFriends}
                    as="div"
                  >
                    Refer a Friend
                  </Sidebar.Item>
                </Link>
                <Link to='/dashboard?tab=trainingVideos'>
                  <Sidebar.Item
                    active={tab === "trainingVideos"}
                    icon={MdVideoLibrary}
                    as="div"
                  >
                    Training Videos
                  </Sidebar.Item>
                </Link>
              </>
            )}
            {currentUser.user.role !== "user" && (
            <>
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
            </>
          )}
            
            
             {currentUser.user.role !== "user" && (
              <>
              <Link to="/dashboard?tab=trading">
                <Sidebar.Item
                  active={tab === "trading"}
                  icon={IoGitCompare }
                  as="div"
                >
                  Create New Trades
                </Sidebar.Item>
              </Link>
              {/* <Link to="/dashboard?tab=tradeMatching">
                <Sidebar.Item
                  active={tab === "tradeMatching"}
                  icon={IoGitCompare }
                  as="div"
                >
                  Trade Matching
                </Sidebar.Item>
              </Link> */}
              <Link to="/dashboard?tab=trades">
                  <Sidebar.Item
                    active={tab === "trades"}
                    icon={HiBriefcase}
                    as="div"
                  >
                    Trade Configuration
                  </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=tradeMonitor">
                  <Sidebar.Item
                    active={tab === "tradeMonitor"}
                    icon={TbHeartRateMonitor}
                    as="div"
                  >
                    Trade Monitor
                  </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=evalPaDetails">
                  <Sidebar.Item
                    active={tab === "evalPaDetails"}
                    icon={FaMoneyBillTrendUp}
                    as="div"
                  >
                    Eval Pa Details
                  </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=accountDetails">
                  <Sidebar.Item
                    active={tab === "accountDetails"}
                    icon={IoMdAnalytics}
                    as="div"
                  >
                   Account Details
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
            {/*{currentUser.user.role !== 'user' &&(
              <Link to="/dashboard?tab=accountDetailsHistory">
                <Sidebar.Item
                  active={tab === "accountDetailsHistory"}
                  icon={FaHistory }
                  as="div"
                >
                  Past Account Details
                </Sidebar.Item>
              </Link>
            )}*/}
            <Sidebar.Item
              icon={HiArrowSmRight}
              className="cursor-pointer"
              onClick={handleSignout}
            >
              Sign Out
            </Sidebar.Item>

          {/* Rules, T & C, Disclaimers */}
          <div className="absolute bottom-0 w-full">
            <Link to="/dashboard?tab=rules">
              <Sidebar.Item active={tab === "rules"} as="div">
                Rules
              </Sidebar.Item>
            </Link>
            <Link to="/dashboard?tab=terms-and-conditions">
              <Sidebar.Item active={tab === "terms-and-conditions"} as="div">
                T & C
              </Sidebar.Item>
            </Link>
            <Link to="/dashboard?tab=disclaimers">
              <Sidebar.Item active={tab === "disclaimers"} as="div">
                Disclaimers
              </Sidebar.Item>
            </Link>
          </div>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    );
}