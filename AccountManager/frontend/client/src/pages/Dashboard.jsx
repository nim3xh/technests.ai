import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashboardComp from "../components/DashboardComp";
import DashboardCompUser from "../components/User/DashboardCompUser";
import DashboardCompSuperUser from "../components/DashboardCompSuperUser";
import DashAccountDetails from "../components/DashAccountDetails";
import DashAccountDetailsUser from "../components/User/DashAccountDetailsUser";
import DashTradeMonitorUser from "../components/User/DashTradeMonitorUser";
import DashUsers from "../components/DashUsers";
import DashAccountOwners from "../components/DashAccountOwners";
import DashTrades from "../components/DashTrades";
import DashUserPasswordChange from "../components/DashUserPasswordChange";
import DashAccountDatailHistoryComp from "../components/DashAccountDatailHistoryComp";
import DashTradingComp from "../components/DashTradingComp";
import DashTradeMonitor from "../components/DashTradeMonitor";
import TradeMatchingCom from "../components/TradeMatchingCom";
import DashEvalPaDetails from "../components/DashEvalPaDetails";
import DashTrainingVideosComp from "../components/User/DashTrainingVideosComp";
import DashReferfriendComp from "../components/User/DashReferfriendComp";
import DashDisclaimersComp from "../components/condtions/DashDisclaimersComp";
import DashTCComp from "../components/condtions/DashTCComp";
import DashRulesComp from "../components/condtions/DashRulesComp";

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
      {tab === "trading" && <DashTradingComp />}
      {/* Trade Monitor */}
      {tab === "tradeMonitor" && <DashTradeMonitor />}
      {/* Trade Matching */}
      {tab === "tradeMatching" && <TradeMatchingCom />}
      {/* Account Details User */}
      {tab === "accountDetailsUser" && <DashAccountDetailsUser />}
      {/* Trade Monitor User */}
      {tab === "tradeMonitorUser" && <DashTradeMonitorUser />}
      {/* Eval Pa Details */}
      {tab === "evalPaDetails" && <DashEvalPaDetails />}
      {/* Training Videos */}
      {tab === "trainingVideos" && <DashTrainingVideosComp />}
      {/* Refer friend */}
      {tab === "referFriend" && <DashReferfriendComp/>}
      {/* Disclaimers */}
      {tab === "disclaimers" && <DashDisclaimersComp/>}
      {/* Terms and Conditions */}
      {tab === "termsConditions" && <DashTCComp/>}
      {/* Rules */}
      {tab === "rules" && <DashRulesComp/>}
    </div>
  );
}