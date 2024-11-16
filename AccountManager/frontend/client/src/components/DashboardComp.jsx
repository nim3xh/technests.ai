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
  Button,
} from "flowbite-react";
import { MdAccountBalance, MdOutlineSurroundSound, MdPerson, MdTableRows } from "react-icons/md";
import { CiMemoPad } from "react-icons/ci";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { Datepicker } from "flowbite-react";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [userStats, setUserStats] = useState([]);
  const [chartData, setChartData] = useState({});
  
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

        // Calculate statistics for each user
        const stats = {};
        let totalEvalActive = 0;
        let totalPAActive = 0;
        let totalEvalAdminOnly = 0;
        let totalPAAdminOnly = 0;

        mergedData.forEach((item) => {
          const userName = item.name;
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

        // Set chart data
        setChartData({
          series: [
            totalEvalActive,
            totalPAActive,
            totalEvalAdminOnly + totalPAAdminOnly,
          ],
          labels: ["EVAL Active", "PA Active", "Admin Only"],
        });
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

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="#" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item></Breadcrumb.Item>
      </Breadcrumb>
      <div className="text-2xl text-center mt-4">
          Welcome, {currentUser.user.FirstName} {currentUser.user.LastName}!
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
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div className="">
                      <h3 className="text-gray-500 text-md uppercase">
                        Total Users{" "}
                      </h3>
                      <p className="text-2xl">{totalUniqueAccountsDisplayed}</p>
                    </div>
                    <MdPerson className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
                  </div>
                </div>

                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-gray-500 text-md uppercase">
                        Total EVAL Active:
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

                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-gray-500 text-md uppercase">
                        Total PA Active:
                      </h3>
                      <p className="text-2xl">
                        {userStats.reduce(
                          (acc, user) => acc + user.paActive,
                          0
                        )}
                      </p>
                    </div>
                    <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
                  </div>
                </div>
                <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-gray-500 text-md uppercase">
                        Total Admin Only:
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

              <div className="flex flex-wrap items-start">
                {/* Pie Chart Section */}
                <div id="pie-chart" className="w-full md:w-1/3 p-3 mt-20">
                  <ReactApexChart
                    options={{
                      series: chartData.series,
                      colors: ["#1C64F2", "#16BDCA", "#9061F9"],
                      chart: {
                        height: 420,
                        type: "pie",
                      },
                      stroke: {
                        colors: ["white"],
                      },
                      plotOptions: {
                        pie: {
                          labels: {
                            show: true,
                          },
                          dataLabels: {
                            offset: -25,
                          },
                        },
                      },
                      labels: chartData.labels,
                      dataLabels: {
                        enabled: true,
                        style: {
                          fontFamily: "Inter, sans-serif",
                          color: "inherit",
                        },
                      },
                      legend: {
                        position: "bottom",
                        fontFamily: "Inter, sans-serif",
                      },
                    }}
                    series={chartData.series || []}
                    type="pie"
                    height={420}
                  />
                </div>

                {/* Datepicker Section (centered between chart and table) */}
                <div className="w-full md:w-1/3 p-3 flex justify-center mt-20">
                  <Datepicker inline />
                </div>

                {/* Table Section */}
                <div className="w-full md:w-1/3 p-3">
                  <Table hoverable className="shadow-md w-full">
                    <TableHead>
                      <TableHeadCell>#</TableHeadCell>
                      <TableHeadCell>User Name</TableHeadCell>
                      <TableHeadCell>EVAL Active</TableHeadCell>
                      <TableHeadCell>PA Active</TableHeadCell>
                      <TableHeadCell>Eval Admin Only</TableHeadCell>
                      <TableHeadCell>PA Admin Only</TableHeadCell>
                      <TableHeadCell>Total Accounts</TableHeadCell>
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
