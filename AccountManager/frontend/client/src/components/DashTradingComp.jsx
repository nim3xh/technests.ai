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
  const [showSelectTradeButton, setShowSelectTradeButton] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [startTime, setStartTime] = useState("06:30");
  const [interval, setInterval] = useState(15);
  const [rowCount, setRowCount] = useState(0);
  const [isDirectionSet, setIsDirectionSet] = useState(false);
  const [isTradeSelected, setIsTradeSelected] = useState(false);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [directions, setDirections] = useState([]);

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
        setIsFindingMatch(true);
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
      setShowSelectTradeButton(false);
      setShowTime(false);
      setIsDirectionSet(false);
      setIsTradeSelected(false);
      setIsFindingMatch(false);
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

  // Helper function to check if two balances are within the specified range
  const withinRange = (balance1, balance2, range = 125) => {
    if (!balance1 || !balance2) return false; // Skip invalid or missing balances
    const diff = Math.abs(parseFloat(balance1) - parseFloat(balance2));
    return diff <= range;
  };

  const createTableData = () => {
    const account1Data = combinedData.filter(
      (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[0]
    );
    const account2Data = combinedData.filter(
      (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[1]
    );
  
    const maxRows = Math.max(account1Data.length, account2Data.length);
  
    const rows = Array.from({ length: maxRows }, (_, i) => {
      const account1 = account1Data[i] || {};
      const account2 = account2Data[i] || {};
  
      const isMatch = withinRange(account1.accountBalance, account2.accountBalance);
  
      // Randomly initialize directions if not set
      if (!directions[i]) {
        const initialDirection1 = Math.random() < 0.5 ? "Long" : "Short";
        const initialDirection2 = initialDirection1 === "Long" ? "Short" : "Long";
        directions[i] = {
          direction1: initialDirection1,
          direction2: initialDirection2,
        };
        setDirections([...directions]); // Update state with initial values
      }
  
      const direction1 = directions[i]?.direction1;
      const direction2 = directions[i]?.direction2;
  
      return {
        direction1,
        account1: account1.account || "-",
        balance1: account1.accountBalance || "-",
        time: timeSlots[i] || "-",
        balance2: account2.accountBalance || "-",
        account2: account2.account || "-",
        direction2,
        isMatch,
      };
    });
  
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
    setShowSelectTradeButton(true);
  }

  const handleDirectionChange = (index, directionType, newDirection) => {
    const updatedDirections = [...directions];
  
    if (!updatedDirections[index]) {
      updatedDirections[index] = { direction1: "Long", direction2: "Short" }; // Default initialization
    }
  
    // Update the selected direction
    updatedDirections[index][directionType] = newDirection;
  
    // If changing direction1, automatically update direction2 to the opposite
    if (directionType === "direction1") {
      updatedDirections[index].direction2 = newDirection === "Long" ? "Short" : "Long";
    }
  
    setDirections(updatedDirections);
  };
  
  const handleSelectTrade = () => {
    setIsTradeSelected(true);
    alert("Trade selected!");
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
                    {!isFindingMatch && (
                      <>
                        {/* Find Match Button */}
                        <Button
                          gradientDuoTone="greenToBlue"
                          onClick={handleFindMatch}
                        >
                          Find Match
                        </Button>
                      </> 
                    )}

                    {isFindingMatch && (
                      <>
                      {/*Clear Selection Button */}
                      <Button
                        gradientDuoTone='pinkToOrange'
                        onClick={handleClearSelection}
                      >
                        Clear Selection
                      </Button>
                      </>
                    )}
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
                    
                    {!isTradeSelected && showAddDirectionButton && (
                      <>
                        <Button gradientDuoTone='tealToLime' onClick={handleSetDirection}>
                          Set Direction
                        </Button>
                      </>
                    )}

                    {showSelectTradeButton && (
                      <>
                        <Button gradientDuoTone='purpleToPink' onClick={handleSelectTrade}>
                          Select Trade
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
                          {isTradeSelected && (
                            <TableHeadCell>Trade</TableHeadCell>
                          )}
                          {isDirectionSet && (
                            <TableHeadCell>Direction (First)</TableHeadCell>
                          )}
                          <TableHeadCell className="w-64">Account (First)</TableHeadCell>
                          <TableHeadCell>Account Balance (First)</TableHeadCell>
                          {showTime && (
                            <TableHeadCell>Time</TableHeadCell>
                          )}
                          <TableHeadCell>Account Balance (Second)</TableHeadCell>
                          <TableHeadCell className="w-64">Account (Second)</TableHeadCell>
                          {isDirectionSet && (
                            <TableHeadCell>Direction (Second)</TableHeadCell>
                          )}
                          {isTradeSelected && (
                            <>
                              <TableHeadCell>Trade</TableHeadCell>
                              <TableHeadCell>Select Accounts</TableHeadCell>
                            </> 
                          )}
                        </TableHead>
                        {/* Table Body */}
                        <TableBody>
                          {createTableData().map((row, index) => (
                            <TableRow
                              key={index}
                              className={row.isMatch ? "bg-green-100" : "bg-white"} // Highlight matching rows
                            >
                              {isTradeSelected && (
                                <TableCell>
                                  {row.isMatch ? "Match" : "No Match"}
                                </TableCell>
                              )}
                              {isDirectionSet && (
                                <TableCell>
                                  {/* {isTradeSelected ? (
                                    row.direction1
                                  ) : (
                                    <Select
                                      value={row.direction1}
                                      onChange={(e) => handleDirectionChange(index, "direction1", e.target.value)}
                                    >
                                      <option value="Long">Long</option>
                                      <option value="Short">Short</option>
                                    </Select>
                                  )} */}
                                  {row.direction1}
                              </TableCell>
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
                                <TableCell>
                                    {/* {isTradeSelected ? (
                                      row.direction2
                                    ) : (
                                      <Select
                                        value={row.direction2}
                                        onChange={(e) => handleDirectionChange(index, "direction2", e.target.value)}
                                      >
                                        <option value="Long">Long</option>
                                        <option value="Short">Short</option>
                                      </Select>
                                    )
                                  } */}
                                  {row.direction2}
                              </TableCell>
                              )}
                              {isTradeSelected && (
                                <>
                                <TableCell>
                                {row.isMatch ? "Match" : "No Match"}
                                </TableCell>
                                <TableCell>
                                  <Button gradientDuoTone='pinkToOrange'>
                                    Select
                                  </Button>
                                </TableCell>
                                </>
                                
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