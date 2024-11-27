import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiHome } from "react-icons/hi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Breadcrumb,
} from "flowbite-react";
import { MdAccountBalance, MdPerson, MdTableRows } from "react-icons/md";
import { CiMemoPad } from "react-icons/ci";
import axios from "axios";
import { Datepicker } from "flowbite-react";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [userStats, setUserStats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todayDate, setTodayDate] = useState(new Date());
  const [paStats, setPaStats] = useState({
    PA1: 0,
    PA2: 0,
    PA3: 0,
    PA4: 0,
  });

  const formattedTodayDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(todayDate);
  
  // Function to merge users and account details data
  const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown",
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = currentUser.token;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usersResponse, accountDetailsResponse] = await Promise.all([
          axios.get(`${BaseURL}users`, { headers }),
          axios.get(`${BaseURL}accountDetails`, { headers }),
        ]);

        const mergedData = mergeData(
          usersResponse.data,
          accountDetailsResponse.data
        );

        setCombinedData(mergedData);
        setLoading(false);

        // Initialize PA account statistics
        const paStats = {
          PA1: 0,
          PA2: 0,
          PA3: 0,
          PA4: 0,
        };
  
        // Categorize and count PA accounts based on account balance
        mergedData.forEach((account) => {
          if (account.account.startsWith("PA")) {
            const balance = parseFloat(account.accountBalance);
            if (balance >= 47500 && balance <= 53200) paStats.PA1++;
            else if (balance >= 53201 && balance <= 55800) paStats.PA2++;
            else if (balance > 55800 && balance <= 58000) paStats.PA3++;
            else if (balance > 58000 && balance <= 60600) paStats.PA4++;
          }
        });
  
        setPaStats(paStats); 

        // Calculate statistics for each user
        const stats = {};
        let totalEvalActive = 0;
        let totalPAActive = 0;
        let totalEvalAdminOnly = 0;
        let totalPAAdminOnly = 0;

        mergedData.forEach((item) => {
          const userName = item.name + " (" + item.accountNumber.replace('APEX-', '') + ")";
          const isPA = item.account.startsWith("PA");
          const isActive = item.status === "active";
          const isEval = item.account.startsWith("APEX");
          const isAdmin = item.status === "admin only";

          // Initialize user stats if not already done
          if (!stats[userName]) {
            stats[userName] = {
              evalActive: 0,
              paActive: 0,
              evalAdminOnly: 0,
              paAdminOnly: 0,
            };
          }

          // Increment counts based on conditions
          if (isEval && isActive) {
            stats[userName].evalActive++;
            totalEvalActive++;
          }
          if (isPA && isActive) {
            stats[userName].paActive++;
            totalPAActive++;
          }
          if (isAdmin && isEval) {
            stats[userName].evalAdminOnly++;
            totalEvalAdminOnly++;
          }
          if (isAdmin && isPA) {
            stats[userName].paAdminOnly++;
            totalPAAdminOnly++;
          }
        });

        // Transform stats into an array for rendering
        const userStatsArray = Object.keys(stats).map((userName) => ({
          userName,
          ...stats[userName],
          totalAccounts: stats[userName].evalActive + stats[userName].paActive,
        }));

        setUserStats(userStatsArray); 
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [BaseURL, currentUser]);

  // Calculate unique accounts from filteredData
  const uniqueAccountsInFilteredData = new Set(
    combinedData.map((item) => `${item.accountNumber} (${item.name})`)
    
  );
  const totalUniqueAccountsDisplayed = uniqueAccountsInFilteredData.size;


  const handleDateChange = (date) => {
    // Get the day of the week for the selected date
    const dayOfWeek = new Date(date).getDay();
    // Day 0 is Sunday and day 6 is Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Alert user or simply return to prevent selecting weekends
      alert("Weekends are not selectable.");
      return;
    }
    setSelectedDate(date);
  };

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="#" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item></Breadcrumb.Item>
      </Breadcrumb>
      <div className="text-center mt-4">
      <div className="text-2xl">
          Welcome, {currentUser.user.FirstName} {currentUser.user.LastName}!
        </div>
      <p className="text-lg font-semibold text-gray-600">Today's Date: {formattedTodayDate}</p> 
      </div>
      
      {currentUser.user.role !== "user" && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div className="flex-wrap flex gap-4 justify-center mt-4">
                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div className="">
                          <h3 className="text-gray-500 text-md uppercase">
                            Users{" "}
                          </h3>
                          <p className="text-2xl">{totalUniqueAccountsDisplayed}</p>
                        </div>
                        <MdPerson className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>

                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-500 text-md uppercase">
                            EVAL
                          </h3>
                          <p className="text-2xl">
                            {userStats.reduce(
                              (acc, user) => acc + user.evalActive,
                              0
                            )}
                          </p>
                        </div>
                        <MdTableRows className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>

                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-500 text-md uppercase">
                            PA1
                          </h3>
                          <p className="text-2xl">
                            {paStats.PA1}
                          </p>
                        </div>
                        <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>

                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-500 text-md uppercase">
                            PA2
                          </h3>
                          <p className="text-2xl">
                            {paStats.PA2}
                          </p>
                        </div>
                        <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-500 text-md uppercase">
                            PA3
                          </h3>
                          <p className="text-2xl">
                            {paStats.PA3}
                          </p>
                        </div>
                        <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-500 text-md uppercase">
                            PA4
                          </h3>
                          <p className="text-2xl">
                            {paStats.PA4}
                          </p>
                        </div>
                        <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>

                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-60 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-500 text-md uppercase">
                            Admin Only
                          </h3>
                          <p className="text-2xl">
                            {userStats.reduce(
                              (acc, user) => acc + user.evalAdminOnly+user.paAdminOnly,
                              0
                            )}
                          </p>
                        </div>
                        <CiMemoPad className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
                    {/* Table Section */}
                    <div className="w-full md:w-1/2 p-3 mt-5">
                      <Table hoverable className="shadow-md w-full">
                        <TableHead>
                          <TableHeadCell>#</TableHeadCell>
                          <TableHeadCell>User Name</TableHeadCell>
                          <TableHeadCell>EVAL</TableHeadCell>
                          <TableHeadCell>PA</TableHeadCell>
                          <TableHeadCell>Eval Admin Only</TableHeadCell>
                          <TableHeadCell>PA Admin Only</TableHeadCell>
                          <TableHeadCell>Total</TableHeadCell>
                        </TableHead>
                        <TableBody>
                          {userStats.map((user, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{user.userName}</TableCell>
                              <TableCell>{user.evalActive}</TableCell>
                              <TableCell>{user.paActive}</TableCell>
                              <TableCell>{user.evalAdminOnly}</TableCell>
                              <TableCell>{user.paAdminOnly}</TableCell>
                              <TableCell>{user.totalAccounts}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
