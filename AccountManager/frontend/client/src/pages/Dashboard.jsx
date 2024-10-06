import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashboardComp from "../components/DashboardComp";
import DashAccountDetails from "../components/DashAccountDetails";
import DashUsers from "../components/DashUsers";
import DashAccountOwners from "../components/DashAccountOwners";

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);


  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* profile */}
      {tab === "profile" && <DashProfile />}
      {/* dashboard comp */}
      {tab === "dash" && <DashboardComp />}
      {/* Account Details */}
      {tab === "accountDetails" && <DashAccountDetails />}
      {/* Users */}
      {tab === "users" && <DashUsers />}
      {/* Account Owners */}
      {tab === "accOwners" && <DashAccountOwners />}
    </div>
  );
}
