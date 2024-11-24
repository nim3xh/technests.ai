import React from 'react'
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Breadcrumb,
  Dropdown,
  Button,
  Modal,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import { HiHome, HiPlusCircle } from "react-icons/hi";
import axios from "axios";
import { MdAccountBalance, MdPerson, MdTableRows } from "react-icons/md";
import { CiMemoPad } from "react-icons/ci";
import { set } from 'lodash';

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTradingComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [userStats, setUserStats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todayDate, setTodayDate] = useState(new Date());
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [paStats, setPaStats] = useState({
    PA1: 0,
    PA2: 0,
    PA3: 0,
    PA4: 0,
  });
  const [showAddTimeButton, setShowAddTimeButton] = useState(false);
  const [showAddDirectionButton, setshowAddDirectionButton] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [startTime, setStartTime] = useState("06:30");
  const [interval, setInterval] = useState(15);
  const [rowCount, setRowCount] = useState(0);
  const [isDirectionSet, setIsDirectionSet] = useState(false);

  const formattedTodayDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(todayDate);

  // Helper to generate time slots
  const generateTimes = (startTime, interval, rows) => {
    const times = [];
    let currentTime = new Date();
    currentTime.setHours(...startTime.split(":").map(Number), 0, 0);
  
    for (let i = 0; i < rows; i++) {
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      times.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
    return times;
  };
  

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

  const encounteredAccounts = new Set();

  const uniqueAccountNumbers = combinedData
    .map((item) => {
      // Match and extract the account number pattern APEX-245360
      const match = item.accountNumber.match(/^(APEX-\d+)/);
      if (match) {
        const accountNumber = match[1];
        if (!encounteredAccounts.has(accountNumber)) {
          encounteredAccounts.add(accountNumber);
          return `${accountNumber} (${item.name})`;
        }
      }
      return null; // Skip if already encountered or no match
    })
    .filter(Boolean); // Filter out null values

    const handleAccountSelection = (account) => {
      if (selectedAccounts.includes(account)) {
        // Remove the account if already selected
        setSelectedAccounts(selectedAccounts.filter((acc) => acc !== account));
      } else {
        if (selectedAccounts.length < 2) {
          // Add the account only if less than two are selected
          setSelectedAccounts([...selectedAccounts, account]);
        } else {
          alert("You can only select up to two accounts.");
        }
      }
    };

    const handleAddTime = () => {
      if (!showTime) {
        const rowsCount = createTableData().length;
        setRowCount(rowsCount);
        const times = generateTimes("6:30", 15, rowsCount); // Default start time 6:30 AM
        setTimeSlots(times);
        setShowTime(true);
        setshowAddDirectionButton(true);
      }
    };

    const handleTimeChange = (index, newTime) => {
      const updatedTimes = [...timeSlots];
      updatedTimes[index] = newTime; 
      setTimeSlots(updatedTimes);
    };
    

    const handleFindMatch = () => {
      if (selectedAccounts.length === 2) {
        setShowTable(true);
        setShowAddTimeButton(true); 
      } else {
        alert("Please select exactly two accounts.");
      }
    };

    const handleClearSelection = () => {
      setSelectedAccounts([]);
      setShowTable(false);
      setShowAddTimeButton(false);
      setshowAddDirectionButton(false);
      setShowTime(false);
      setIsDirectionSet(false);
    }
    
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
    
          // Initialize user statistics
          const stats = {};
          let totalEvalActive = 0;
          let totalPAActive = 0;
          let totalEvalAdminOnly = 0;
          let totalPAAdminOnly = 0;
    
          // Calculate statistics for each user
          mergedData.forEach((item) => {
            const userName = item.name;
            const isPA = item.account.startsWith("PA");
            const isActive = item.status === "active";
            const isEval = item.account.startsWith("APEX");
            const isAdmin = item.status === "admin only";
    
            // Initialize stats for the user if not already present
            if (!stats[userName]) {
              stats[userName] = {
                evalActive: 0,
                paActive: 0,
                evalAdminOnly: 0,
                paAdminOnly: 0,
              };
            }
    
            // Update stats based on account type and status
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
    
          // Prepare user stats array for rendering
          const userStatsArray = Object.keys(stats).map((userName) => ({
            userName,
            ...stats[userName],
            totalAccounts: stats[userName].evalActive + stats[userName].paActive,
          }));
    
          setUserStats(userStatsArray);
          setLoading(false);
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

  const createTableData = () => {
    // Filter and find data for the selected accounts
    const account1Data = combinedData.filter(
      (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[0]
    );
    const account2Data = combinedData.filter(
      (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[1]
    );
  
    // Determine the maximum number of rows to display
    const maxRows = Math.max(account1Data.length, account2Data.length);
  
    // Helper function to check if two balances are within the $125 range
    const withinRange = (balance1, balance2) => {
      if (!balance1 || !balance2) return false; // Skip invalid or missing balances
      const diff = Math.abs(parseFloat(balance1) - parseFloat(balance2));
      return diff <= 125;
    };
  
    // Generate rows for the table
    const rows = [];
    for (let i = 0; i < maxRows; i++) {
      const account1 = account1Data[i] || {}; // Default to empty object if no more rows
      const account2 = account2Data[i] || {};
  
      const isMatch = withinRange(account1.accountBalance, account2.accountBalance);
  
      // Randomly assign a direction for the first account
      const direction1 = isDirectionSet ? (Math.random() < 0.5 ? "Long" : "Short") : null;
  
      // Automatically assign the opposite direction for the second account
      const direction2 = direction1 === "Long" ? "Short" : "Long";
  
      rows.push({
        direction1,
        account1: account1.account || "-",
        balance1: account1.accountBalance || "-",
        time: timeSlots[i] || "-",
        balance2: account2.accountBalance || "-",
        account2: account2.account || "-",
        direction2,
        isMatch,
      });
    }
  
    return rows;
  };
  
  const handleStartTimeUpdate = (newStartTime) => {
    setStartTime(newStartTime);
    const updatedTimes = generateTimes(newStartTime, interval, rowCount);
    setTimeSlots(updatedTimes);
  };
  
  const handleIntervalUpdate = (newInterval) => {
    setInterval(newInterval);
    const updatedTimes = generateTimes(startTime, newInterval, rowCount);
    setTimeSlots(updatedTimes);
  };

  const handleSetDirection = () => {
    setIsDirectionSet(true);
    alert('Direction has been set');
  }
  
  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Trade</Breadcrumb.Item>
      </Breadcrumb>
    
      <p className="text-lg font-semibold text-gray-600">Date: {formattedTodayDate}</p> 
      <div className="flex items-center justify-between mb-3">
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
                  <br />
                  <Dropdown
                        label={
                          selectedAccounts.length > 0
                            ? selectedAccounts.join(", ")
                            : "Select Pair"
                        }
                        className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
                        inline
                      >
                      <Dropdown.Item onClick={() => handleClearSelection()}>
                              Clear Selection
                            </Dropdown.Item>
                            {uniqueAccountNumbers.map((account) => (
                              <Dropdown.Item
                                key={account}
                                onClick={() => handleAccountSelection(account)}
                              >
                                {selectedAccounts.includes(account) ? "✓ " : ""} {account}
                              </Dropdown.Item>
                            ))}
                  </Dropdown>
                  <div className="flex items-center space-x-4 mt-4">
                    <Button
                      gradientDuoTone="greenToBlue"
                      onClick={handleFindMatch}
                    >
                      Find Match
                    </Button>
                    {/* Add Time Button */}
                    {!isDirectionSet && showAddTimeButton && (
                      <>
                        <Button gradientDuoTone='purpleToPink' onClick={handleAddTime}>
                          Add Time
                        </Button>
                        {showTime && (
                            <div className="flex space-x-4 mt-4">
                              <div>
                                <TextInput
                                  id="startTime"
                                  type="time"
                                  value={startTime}
                                  onChange={(e) => handleStartTimeUpdate(e.target.value)}
                                />
                                <Label htmlFor="startTime">Start Time</Label>
                              </div>
                              <div>
                                <TextInput
                                  id="interval"
                                  type="number"
                                  min={1}
                                  value={interval}
                                  onChange={(e) => handleIntervalUpdate(parseInt(e.target.value, 10))}
                                />
                                <Label htmlFor="interval">Interval (Minutes)</Label>
                              </div>
                            </div>
                        )}
                      </>
                    )}
                    
                    {showAddDirectionButton && (
                      <>
                        <Button gradientDuoTone='tealToLime' onClick={handleSetDirection}>
                          Set Direction
                        </Button>
                      </>
                    )}
                  </div>

                  {showTable && selectedAccounts.length === 2 && (
                    <div className="flex flex-col justify-center items-center mt-5">
                      <h3 className="text-center font-bold text-lg mb-4">Summary of Accounts</h3>
                      <div className="flex justify-center space-x-4">
                        <h4 className="text-center font-bold text-sm text-gray-500">{selectedAccounts[0]}</h4>
                        <h4 className="text-center font-bold text-sm text-gray-500">{selectedAccounts[1]}</h4>
                      </div>
                      <Table>
                        {/* Table Header */}
                        <TableHead>
                          {isDirectionSet && (
                            <TableHeadCell>Direction (First)</TableHeadCell>
                          )}
                          <TableHeadCell className="w-64">Account (First)</TableHeadCell>
                          <TableHeadCell>Account Balance (First)</TableHeadCell>
                          {showTime && (
                            <TableHeadCell className="w-64">Time</TableHeadCell>
                          )}
                          <TableHeadCell>Account Balance (Second)</TableHeadCell>
                          <TableHeadCell className="w-64">Account (Second)</TableHeadCell>
                          {isDirectionSet && (
                            <TableHeadCell>Direction (Second)</TableHeadCell>
                          )}
                        </TableHead>
                        {/* Table Body */}
                        <TableBody>
                          {createTableData().map((row, index) => (
                            <TableRow
                              key={index}
                              className={row.isMatch ? "bg-green-100" : "bg-white"} // Highlight matching rows
                            >
                              {isDirectionSet && (
                                <TableCell>{row.direction1 || "-"}</TableCell>
                              )}
                              <TableCell>{row.account1 || "-"}</TableCell>
                              <TableCell>
                                {row.balance1 !== "-" ? `$${row.balance1}` : "-"}
                              </TableCell>
                                {showTime && (
                                  <TableCell>
                                    {isDirectionSet ? (
                                        row.time
                                      ) : (
                                        <input
                                          type="time"
                                          value={row.time} // Ensure row.time is in HH:mm format
                                          onChange={(e) => handleTimeChange(index, e.target.value)}
                                          className="text-center border rounded-md p-1 w-full"
                                        />
                                      )}
                                  </TableCell>
                                )}
                              <TableCell>
                                {row.balance2 !== "-" ? `$${row.balance2}` : "-"}
                              </TableCell>
                              <TableCell>{row.account2 || "-"}</TableCell>
                              {isDirectionSet && (
                                <TableCell>{row.direction2 || "-"}</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
              </>
          )}
        </>
      )}    
    </div>
  )
}