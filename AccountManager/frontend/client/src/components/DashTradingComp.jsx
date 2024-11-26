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
  Checkbox,
} from "flowbite-react";
import { HiHome, HiPlusCircle } from "react-icons/hi";
import axios from "axios";
import { MdAccountBalance, MdPerson, MdTableRows } from "react-icons/md";
import { CiMemoPad } from "react-icons/ci";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTradingComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [userStats, setUserStats] = useState([]);
  const [todayDate, setTodayDate] = useState(new Date());
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [paStats, setPaStats] = useState({
    PA1: 0,
    PA2: 0,
    PA3: 0,
    PA4: 0,
  });
  const [timeSlots, setTimeSlots] = useState([]);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [directions, setDirections] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [showSetTradesButton, setshowSetTradesButton] = useState(false);
  const [showExportCSVButton,setshowExportCSVButton] = useState(false);
  const [isTradeSet, setIsTradeSet] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    EVAL: false,
    PA: false,
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

    const handleFindMatch = () => {
      if (selectedAccounts.length === 2) {
        setIsFindingMatch(true);
        setshowSetTradesButton(true);
        setShowTable(true);
        // setShowAddTimeButton(true); 
      } else {
        alert("Please select exactly two accounts.");
      }
    };

    const handleClearSelection = () => {
      setSelectedAccounts([]);
      setShowTable(false);
      setIsFindingMatch(false);
      setshowSetTradesButton(false);
      setIsTradeSet(false);
      setshowExportCSVButton(false);
    }
        
    const fetchTrades = async () => {
      try {
        const token = currentUser.token;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const tradesResponse = await axios.get(`${BaseURL}trades`, {
          headers,
        });
        setTradesData(tradesResponse.data);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while fetching data.");
        setLoading(false);
      }
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
      fetchTrades();
    }, [BaseURL, currentUser]);
    

  // Calculate unique accounts from filteredData
  const uniqueAccountsInFilteredData = new Set(
    combinedData.map((item) => `${item.accountNumber} (${item.name})`)
  );

  const totalUniqueAccountsDisplayed = uniqueAccountsInFilteredData.size;


  const getTradeName = (accountNumber) => {
    if (!accountNumber) return "-"; // Handle case when accountNumber is null/undefined
    const apexIdMatch = accountNumber.match(/APEX-(\d+)/);
    if (apexIdMatch) {
      const apexId = Number(apexIdMatch[1]); // Convert extracted apexId to a number
  
      // Filter all trades that match the apexId
      const matchingTrades = tradesData?.filter(
        (trade) => Number(trade?.ApexId) === apexId // Convert trade.ApexId to a number and compare
      );
  
      // If matches exist, return a random trade name
      if (matchingTrades && matchingTrades.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingTrades.length);
        return matchingTrades[randomIndex]?.TradeName || "-";
      }
    }
    return "-"; // Return fallback value if no match
  };
  
  const createTableData = () => {
    // Filter out rows with status "admin only"
    let filtered = combinedData.filter((account) => account.status !== "admin only");

    // Apply filters based on selectedFilters
    if (selectedFilters.PA) {
        filtered = filtered.filter((item) => item.account.startsWith("PA"));
    }

    if (selectedFilters.EVAL) {
        filtered = filtered.filter((item) => item.account.startsWith("APEX"));
    }

    // Filter based on selected accounts from dropdown
    const account1Data = filtered.filter(
        (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[0]
    );
    const account2Data = filtered.filter(
        (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[1]
    );

    // Sort by accountBalance in ascending order
    const sortedAccount1Data = account1Data.sort((a, b) => a.accountBalance - b.accountBalance);
    const sortedAccount2Data = account2Data.sort((a, b) => a.accountBalance - b.accountBalance);

    const maxRows = Math.max(sortedAccount1Data.length, sortedAccount2Data.length);

    // Directions array to hold directions for each row
    let directions = [];

    // Build table rows
    const rows = Array.from({ length: maxRows }, (_, i) => {
        const account1 = sortedAccount1Data[i] || {};
        const account2 = sortedAccount2Data[i] || {};

        // Initialize directions
        let direction1 = "-";
        let direction2 = "-";

        // Set direction1 if account1 exists, otherwise leave it as default "-"
        if (account1.account) {
            direction1 = directions[i]?.direction1 || (Math.random() < 0.5 ? "Long" : "Short");
        }

        // Set direction2 based on direction1 if account2 exists
        if (account2.account) {
            direction2 = directions[i]?.direction2 || (direction1 === "Long" ? "Short" : "Long");
        }

        // Update directions array to store direction1 and direction2 for this row
        if (!directions[i] && (account1.account || account2.account)) {
            directions[i] = { direction1, direction2 };
        }

        // Return row data
        return {
            direction1,
            account1: account1.account || "-",
            balance1: account1.accountBalance || "-",
            time: timeSlots[i] || "-",
            balance2: account2.accountBalance || "-",
            account2: account2.account || "-",
            direction2,
            trade1: account1.account ? getTradeName(account1.account) : "-",
            trade2: account2.account ? getTradeName(account2.account) : "-",
        };
    });

    // Return the generated rows
    return rows;
};


  const handleFilterChange = (filter) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter], // Toggle the filter
    }));
  
    // Clear selection if filters change
    handleClearSelection();
  };
  
  const setTrades = async () => {
    setIsTradeSet(true);
    setshowExportCSVButton(true);
  }

  const exportCSV = () => {
    const tableData = createTableData();
  
    // Generate headers for table data CSV
    const tableHeaders = [
      `Trade (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
      `Direction (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
      `Account (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
      `Account Balance (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
      `Account Balance (${selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})`,
      `Account (${selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})`,
      `Trade (${selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})`,
      `Direction (${selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})`,
    ];
  
    const tableCSV = [tableHeaders.join(",")];
    tableData.forEach((row) => {
      tableCSV.push(
        [
          row.trade1,
          row.direction1,
          row.account1,
          row.balance1,
          row.balance2,
          row.account2,
          row.direction2,
          row.trade2,
        ].join(",")
      );
    });
  
    // Helper function to create trade-specific CSV
    const createTradeCSV = (tradeData, accountLabel, accountNumbers,accountDirection) => {
      const tradeHeaders = [
        `Direction (${accountLabel})`,
        "Instrument",
        "Quantity",
        "Time",
        "Stop Loss",
        "Profit",
        "Use Breakeven",
        "Breakeven Trigger",
        "Breakeven Offset",
        "Use Trail",
        "Trail Trigger",
        "Trail",
        "Account Number", // Add account number as the last column
      ];
  
      const tradeCSV = [tradeHeaders.join(",")];
      tradeData.forEach((trade, index) => {
        tradeCSV.push(
          [
            accountDirection[index],
            trade.Instrument,
            trade.Quantity,
            trade.Time,
            trade.StopLoss,
            trade.Profit,
            trade.UseBreakeven,
            trade.BreakevenTrigger,
            trade.BreakevenOffset,
            trade.UseTrail,
            trade.TrailTrigger,
            trade.Trail,
            accountNumbers[index] || "-", // Add account number or "-" if not available
          ].join(",")
        );
      });
  
      return tradeCSV.join("\n");
    };
  
    // Extract relevant trades and account numbers for each account
    const account1Trades = tableData
      .map((row) => ({
        trade: tradesData.find((trade) => trade.TradeName === row.trade1),
        accountNumber: row.account1,
        directions: row.direction1,
      }))
      .filter((item) => item.trade);
  
    const account2Trades = tableData
      .map((row) => ({
        trade: tradesData.find((trade) => trade.TradeName === row.trade2),
        accountNumber: row.account2,
        directions: row.direction2,
      }))
      .filter((item) => item.trade);
  
    // Prepare data for trade CSVs
    const account1TradeCSV = createTradeCSV(
      account1Trades.map((item) => item.trade),
      selectedAccounts[0].replace(/APEX-/, "").split(" ")[0],
      account1Trades.map((item) => item.accountNumber),
      account1Trades.map((item) => item.directions)
    );
  
    const account2TradeCSV = createTradeCSV(
      account2Trades.map((item) => item.trade),
      selectedAccounts[1].replace(/APEX-/, "").split(" ")[0],
      account2Trades.map((item) => item.accountNumber),
      account2Trades.map((item) => item.directions)
    );
  
    // Determine filter suffix for filenames
    const filterSuffix = selectedFilters.PA ? "_PA" : selectedFilters.EVAL ? "_EVAL" : "";

    // Dynamic file names
    const account1FileName = `${selectedAccounts[0]
      .replace(/APEX-/, "")
      .split(" ")[0]}${filterSuffix}.csv`;

    const account2FileName = `${selectedAccounts[1]
      .replace(/APEX-/, "")
      .split(" ")[0]}${filterSuffix}.csv`;

    // Download the three CSV files
    const downloadCSV = (content, filename) => {
      const blob = new Blob([content], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    downloadCSV(
      tableCSV.join("\n"),
      `trade_table_data_${new Date().toISOString()}${filterSuffix}.csv`
    );
    downloadCSV(account1TradeCSV, account1FileName);
    downloadCSV(account2TradeCSV, account2FileName);
  };

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
                        ? selectedAccounts
                            .map((account) => account.replace(/APEX-/, "")) // Remove "APEX-"
                            .join(", ")
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
                        {selectedAccounts.includes(account) ? "✓ " : ""}{" "}
                        {account.replace(/APEX-/, "")} {/* Display without "APEX-" */}
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
                    {showSetTradesButton && !showExportCSVButton && (
                      <Button
                        gradientDuoTone='greenToBlue'
                        onClick={setTrades}
                      >
                        Set Trades
                      </Button>
                    )}
                    {showExportCSVButton && (
                      <Button
                        gradientDuoTone='greenToBlue'
                        onClick={exportCSV}
                      >
                        Export CSV
                      </Button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex space-x-4 mb-4">
                    <div className="flex items-center">
                      <Checkbox
                        id="eval"
                        checked={selectedFilters.EVAL}
                        onChange={() => handleFilterChange("EVAL")}
                      />
                      <label htmlFor="eval" className="ml-2 text-sm font-medium">
                        EVAL Accounts
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="pa"
                        checked={selectedFilters.PA}
                        onChange={() => handleFilterChange("PA")}
                      />
                      <label htmlFor="pa" className="ml-2 text-sm font-medium">
                        PA Accounts
                      </label>
                    </div>
                  </div>
                  {showTable && selectedAccounts.length === 2 && (
                    <div className="flex flex-col justify-center items-center mt-5">
                      <h3 className="text-center font-bold text-lg mb-4">Summary of Accounts</h3>
                      <div className="flex justify-center space-x-4">
                        <h4 className="text-center font-bold text-sm text-gray-500">{selectedAccounts[0].replace(/APEX-/, "")}</h4>
                        <h4 className="text-center font-bold text-sm text-gray-500">{selectedAccounts[1].replace(/APEX-/, "")}</h4>
                      </div>
                      <Table>
                        {/* Table Header */}
                        <TableHead>
                          {isTradeSet && (
                              <>
                              <TableHeadCell>Trade ({selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                              <TableHeadCell>Direction ({selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                            </>
                            )
                          }
                          <TableHeadCell className="w-64">Account ({selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                          <TableHeadCell>Account Balance ({selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                          <TableHeadCell>Account Balance ({selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                          <TableHeadCell className="w-64">Account ({selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                          {isTradeSet && (
                              <>
                              <TableHeadCell>Trade ({selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                              <TableHeadCell>Direction ({selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]})</TableHeadCell>
                            </>
                            )
                          }
                        </TableHead>
                        {/* Table Body */}
                        <TableBody>
                          {createTableData().map((row, index) => (
                            <TableRow
                              key={index}
                            >
                              {isTradeSet && (
                                <>
                                <TableCell>{row.trade1}</TableCell>
                                <TableCell>{row.direction1}</TableCell>
                                </>
                              )
                              }
                              <TableCell>{row.account1 || "-"}</TableCell>
                              <TableCell>
                                {row.balance1 !== "-" ? `$${row.balance1}` : "-"}
                              </TableCell>
                              <TableCell>
                                {row.balance2 !== "-" ? `$${row.balance2}` : "-"}
                              </TableCell>
                              <TableCell>{row.account2 || "-"}</TableCell>
                              {isTradeSet && (
                                <>
                                <TableCell>{row.trade2}</TableCell>
                                <TableCell>{row.direction2}</TableCell>
                                </>
                              )
                              }
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