import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashboardComp from "../components/DashboardComp";
import DashboardCompUser from "../components/User/DashboardCompUser";
import DashboardCompSuperUser from "../components/DashboardCompSuperUser";
import DashAccountDetails from "../components/DashAccountDetails";
import DashAccountDetailsUser from "../components/User/DashAccountDetailsUser";
import DashUsers from "../components/DashUsers";
import DashAccountOwners from "../components/DashAccountOwners";
import DashTrades from "../components/DashTrades";
import DashUserPasswordChange from "../components/DashUserPasswordChange";
import DashAccountDatailHistoryComp from "../components/DashAccountDatailHistoryComp";
import DashTradingComp from "../components/DashTradingComp";
import DashTradeMonitor from "../components/DashTradeMonitor";
import TradeMatchingCom from "../components/TradeMatchingCom";

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
      {/* password-change */}
      {tab === "password-change" && <DashUserPasswordChange />}
      {/* dashboard comp */}
      {tab === "dash" && <DashboardComp />}
      {/* dashboard comp user */}
      {tab === "dashUser" && <DashboardCompUser />}
      {/* dashboard comp super user */}
      {tab === "dashSuperUser" && <DashboardCompSuperUser />}
      {/* Account Details */}
      {tab === "accountDetails" && <DashAccountDetails />}
      {/* Account Details History */}
      {tab === "accountDetailsHistory" && <DashAccountDatailHistoryComp />}
      {/* Users */}
      {tab === "users" && <DashUsers />}
      {/* Account Owners */}
      {tab === "accOwners" && <DashAccountOwners />}
      {/* Trades */}
      {tab === "trades" && <DashTrades />}
      {/* Trading */}
      {tab === "trading" && <DashTradingComp />}'
      {/* Trade Monitor */}
      {tab === "tradeMonitor" && <DashTradeMonitor />}'
      {/* Trade Matching */}
      {tab === "tradeMatching" && <TradeMatchingCom />}
      {/* Account Details User */}
      {tab === "accountDetailsUser" && <DashAccountDetailsUser />}
    </div>
  );
}