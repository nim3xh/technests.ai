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

  const exportCSV = async () => {
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
      

      const convertTo12HourFormat = (time) => {
        const [hours, minutes, seconds] = time.split(":");
        let hour = parseInt(hours, 10);
        const modifier = hour >= 12 ? "PM" : "AM";
        
        if (hour === 0) {
            hour = 12; // 0 hour in 24-hour format is 12 AM
        } else if (hour > 12) {
            hour -= 12; // Convert hour greater than 12 to PM format
        }
        
        return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
    };
      
      // Helper function to create trade-specific CSV
      const createTradeCSV = (tradeData, accountLabel, accountNumbers, accountDirection) => {
          const tradeHeaders = [
              `Direction (${accountLabel})`,
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
              "Instrument",
              "Account Number", // Add account number as the last column
          ];

          const tradeCSV = [tradeHeaders.join(",")];
          tradeData.forEach((trade, index) => {
              tradeCSV.push(
                  [
                      accountDirection[index],
                      trade.Quantity,
                      convertTo12HourFormat(trade.Time),
                      trade.StopLoss,
                      trade.Profit,
                      trade.UseBreakeven,
                      trade.BreakevenTrigger,
                      trade.BreakevenOffset,
                      trade.UseTrail,
                      trade.TrailTrigger,
                      trade.Trail,
                      trade.Instrument,
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
      let filterSuffix = selectedFilters.PA ? "_PA" : selectedFilters.EVAL ? "_EVAL" : "";

      // If neither PA nor EVAL is set, set filterSuffix to "_trades"
      if (!selectedFilters.PA && !selectedFilters.EVAL) {
          filterSuffix = "_trades";
      }

      // Dynamic file names
      const account1FileName = `${selectedAccounts[0]
          .replace(/APEX-/, "")
          .split(" ")[0]}${filterSuffix}.csv`;

      const account2FileName = `${selectedAccounts[1]
          .replace(/APEX-/, "")
          .split(" ")[0]}${filterSuffix}.csv`;

      // Function to save CSV to backend using POST request
        const saveCSVToBackend = async (csvData, filename, apexid) => {
          const formData = new FormData();
          
          // Ensure the field name matches what the backend expects (csvFile)
          formData.append("csvFile", new Blob([csvData], { type: "text/csv" }), filename);
          formData.append("apexid", apexid);  // Append apexid to the form data

          try {
              const response = await axios.post(`${BaseURL}upload-trade`, formData, {
                  headers: {
                      "Content-Type": "multipart/form-data",
                  },
              });
              // console.log("File uploaded successfully:", response.data);
          } catch (error) {
              console.error("Error uploading file:", error);
          }
        };


        // Helper function to download CSV
        const downloadCSV = (content, filename) => {
          const blob = new Blob([content], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url); // Clean up after the download
        };

        // Download the three CSV files
        downloadCSV(
          tableCSV.join("\n"),
          `trade_table_data_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}${filterSuffix}.csv`
        );
        downloadCSV(account1TradeCSV, account1FileName);
        downloadCSV(account2TradeCSV, account2FileName);


        // Save files to backend
        // await saveCSVToBackend(tableCSV.join("\n"), `trade_table_data_${new Date().toISOString()}${filterSuffix}.csv`);
        await saveCSVToBackend(account1TradeCSV, account1FileName,selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]);
        await saveCSVToBackend(account2TradeCSV, account2FileName,selectedAccounts[1].replace(/APEX-/, "").split(" ")[0]);
  };


  const createTableDataForOneAccount = () => {
      // Filter out rows with status "admin only"
      let filtered = combinedData.filter((account) => account.status !== "admin only");

      // Apply filters based on selectedFilters
      if (selectedFilters.PA) {
          filtered = filtered.filter((item) => item.account.startsWith("PA"));
      }

      if (selectedFilters.EVAL) {
          filtered = filtered.filter((item) => item.account.startsWith("APEX"));
      }

      // Filter based on selected account from dropdown (assuming only one account selected)
      const accountData = filtered.filter(
          (account) => `${account.accountNumber} (${account.name})` === selectedAccounts[0]
      );

      // Exclude accounts with a balance greater than 53,000
      const filteredAccountData = accountData.filter(
          (account) => account.accountBalance <= 53000
      );

      // Sort by accountBalance in ascending order
      const sortedAccountData = filteredAccountData.sort((a, b) => a.accountBalance - b.accountBalance);

      // Maximum number of rows will be based on the filteredAccountData
      const maxRows = sortedAccountData.length;

      // Directions array to hold directions for each row
      let directions = [];

      // Build table rows for one account
      const rows = Array.from({ length: maxRows }, (_, i) => {
          const account = sortedAccountData[i] || {};

          // Initialize direction
          let direction = "-";

          // Set direction if account exists
          if (account.account) {
              direction = directions[i]?.direction || (Math.random() < 0.5 ? "Long" : "Short");
          }

          // Update directions array to store direction for this row
          if (!directions[i] && account.account) {
              directions[i] = { direction };
          }

          // Return row data
          return {
              direction,
              account: account.account || "-",
              balance: account.accountBalance || "-",
              time: timeSlots[i] || "-",
              trade: account.account ? getTradeName(account.account) : "-",
          };
      });

      // Return the generated rows
      return rows;
  };

  const exportCSVForEachAccount = async () => {
      // Iterate through each account in uniqueAccountNumbers
      for (let accountString of uniqueAccountNumbers) {
          // Create a local selectedAccounts array for the current iteration
          setSelectedAccounts([...selectedAccounts, accountString]);

          // Generate table data for this account
          const tableData = createTableDataForOneAccount();

          // Generate headers for table data CSV
          const tableHeaders = [
              `Trade (${accountString.replace(/APEX-/, "").split(" ")[0]})`,
              `Direction (${accountString.replace(/APEX-/, "").split(" ")[0]})`,
              `Account (${accountString.replace(/APEX-/, "").split(" ")[0]})`,
              `Account Balance (${accountString.replace(/APEX-/, "").split(" ")[0]})`
          ];

          const tableCSV = [tableHeaders.join(",")];
          tableData.forEach((row) => {
              tableCSV.push(
                  [
                      row.trade,
                      row.direction,
                      row.account,
                      row.balance,
                  ].join(",")
              );
          });

          // Convert time format for the CSV
          const convertTo12HourFormat = (time) => {
              const [hours, minutes, seconds] = time.split(":");
              let hour = parseInt(hours, 10);
              const modifier = hour >= 12 ? "PM" : "AM";
              if (hour === 0) hour = 12; // 0 hour in 24-hour format is 12 AM
              else if (hour > 12) hour -= 12; // Convert hour greater than 12 to PM format
              return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
          };

          // Helper function to create trade-specific CSV
          const createTradeCSV = (tradeData, accountLabel, accountNumbers, accountDirection) => {
              const tradeHeaders = [
                  `Direction (${accountLabel})`,
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
                  "Instrument",
                  "Account Number", // Add account number as the last column
              ];

              const tradeCSV = [tradeHeaders.join(",")];
              tradeData.forEach((trade, index) => {
                  tradeCSV.push(
                      [
                          accountDirection[index],
                          trade.Quantity,
                          convertTo12HourFormat(trade.Time),
                          trade.StopLoss,
                          trade.Profit,
                          trade.UseBreakeven,
                          trade.BreakevenTrigger,
                          trade.BreakevenOffset,
                          trade.UseTrail,
                          trade.TrailTrigger,
                          trade.Trail,
                          trade.Instrument,
                          accountNumbers[index] || "-", // Add account number or "-" if not available
                      ].join(",")
                  );
              });

              return tradeCSV.join("\n");
          };

          // Extract relevant trades and account numbers for each account
          const accountTrades = tableData.map((row) => ({
              trade: tradesData.find((trade) => trade.TradeName === row.trade),
              accountNumber: row.account,
              direction: row.direction,
          })).filter((item) => item.trade);

          // Prepare data for trade CSV
          const tradeCSV = createTradeCSV(
              accountTrades.map((item) => item.trade),
              accountString.replace(/APEX-/, "").split(" ")[0],
              accountTrades.map((item) => item.accountNumber),
              accountTrades.map((item) => item.direction)
          );

          // Dynamic file name for each account's CSV
          const accountFileName = `${accountString.replace(/APEX-/, "").split(" ")[0]}_trades.csv`;

          // Helper function to download CSV
          const downloadCSV = (content, filename) => {
              const blob = new Blob([content], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              a.click();
              URL.revokeObjectURL(url); // Clean up after the download
          };

          // Download the CSV for this account
          // downloadCSV(tableCSV.join("\n"), accountFileName);
          downloadCSV(tradeCSV, `${accountFileName}`);

          // Save files to backend
          // await saveCSVToBackend(tableCSV.join("\n"), accountFileName, accountString.replace(/APEX-/, "").split(" ")[0]);
          await saveCSVToBackend(tradeCSV, `${accountFileName}`, accountString.replace(/APEX-/, "").split(" ")[0]);
      }
  };

  // Function to save CSV to backend
  const saveCSVToBackend = async (csvData, filename, apexid) => {
      const formData = new FormData();
      formData.append("csvFile", new Blob([csvData], { type: "text/csv" }), filename);
      formData.append("apexid", apexid);  // Append apexid to the form data

      try {
          const response = await axios.post(`${BaseURL}upload-trade`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
          });
      } catch (error) {
          console.error("Error uploading file:", error);
      }
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
                  
                  <div className="flex items-center space-x-4 mt-4">
                    {!isFindingMatch && (
                      <>
                        {/* Find Match Button */}
                        <Button
                          gradientDuoTone="greenToBlue"
                          onClick={exportCSVForEachAccount}
                        >
                          Make Trades CSV
                        </Button>
                      </> 
                    )}
                  </div>

                  {/* Filters */}
                  {/* <div className="flex space-x-4 mb-4">
                    <div className="flex items-center">
                      <Checkbox
                        id="eval"
                        checked={selectedFilters.EVAL}
                        onChange={() => handleFilterChange("EVAL")}
                      />
                      <label htmlFor="eval" className="ml-2 text-sm font-medium">
                        EVAL Only
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="pa"
                        checked={selectedFilters.PA}
                        onChange={() => handleFilterChange("PA")}
                      />
                      <label htmlFor="pa" className="ml-2 text-sm font-medium">
                        PA Only
                      </label>
                    </div>
                  </div> */}
              </>
          )}
        </>
      )}    
    </div>
  )
}