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
import useRealTimeDate from '../hooks/useRealTimeDate';

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTradingComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileCreationData, setFileCreationData] = useState([]);
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
  const [tradesData, setTradesData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    EVAL: false,
    PA: false,
  });

  const formattedTodayDate = useRealTimeDate();
  
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
            if (account.account.startsWith("PA") && account.status === "active") {
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
          alert("Error fetching data:", err);
          setError("Something went wrong while fetching data.");
          setLoading(false);
        }
      };
    
      fetchData();
      fetchTrades();
      fetchFileCreationTime();
    }, [BaseURL, currentUser]);

  // Calculate unique accounts from filteredData
  const uniqueAccountsInFilteredData = new Set(
    combinedData.map((item) => `${item.accountNumber} (${item.name})`)
  );

  const totalUniqueAccountsDisplayed = uniqueAccountsInFilteredData.size;

  const fetchFileCreationTime = async () => {
    try {
      // Send a GET request without the apexid query parameter
      const response = await axios.get(`${BaseURL}file-creation-time`);
  
      // Set the response data to the state
      setFileCreationData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while fetching file creation times.");
      setLoading(false);
    }
  };
  
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
  
  const exportCSVForEachAccount = async () => {
      let downloadConfirmed = false;
      let downloadCancelled = false;
      let newSelectedAccounts = [...selectedAccounts];

      const createTableDataForOneAccount = () => {
        let filtered = combinedData.filter((account) => account.status !== "admin only");

        if (selectedFilters.PA) {
            filtered = filtered.filter((item) => item.account.startsWith("PA"));
        }

        if (selectedFilters.EVAL) {
            filtered = filtered.filter((item) => item.account.startsWith("APEX"));
        }

        const accountData = filtered.filter((account) => {
            // console.log('Selected Account:', newSelectedAccounts[0]);
            // console.log('Checking Account:', `${account.accountNumber} (${account.name})`);
            return `${account.accountNumber} (${account.name})` === newSelectedAccounts[0];
        });

        // Additional filtering by balance
        const filteredAccountData = accountData.filter(
            (account) => account.accountBalance <= 53000
        );

        // Sorting account data
        const sortedAccountData = filteredAccountData.sort((a, b) => a.accountBalance - b.accountBalance);

        const maxRows = sortedAccountData.length;
        let directions = [];

        const rows = Array.from({ length: maxRows }, (_, i) => {
            const account = sortedAccountData[i] || {};
            let direction = "-";

            if (account.account) {
                direction = directions[i]?.direction || (Math.random() < 0.5 ? "Long" : "Short");
            }

            if (!directions[i] && account.account) {
                directions[i] = { direction };
            }

            return {
                direction,
                account: account.account || "-",
                balance: account.accountBalance || "-",
                time: timeSlots[i] || "-",
                trade: account.account ? getTradeName(account.account) : "-",
            };
        });

        return rows;
      };

      const convertTo12HourFormat = (time) => {
        const [hours, minutes, seconds] = time.split(":");
        let hour = parseInt(hours, 10);
        const modifier = hour >= 12 ? "PM" : "AM";
        if (hour === 0) hour = 12; 
        else if (hour > 12) hour -= 12;
        return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
      };

      const createTradeCSV = (tradeData, accountLabel, accountNumbers, accountDirection) => {
        const tradeHeaders = [
            `Direction (${accountLabel})`,
            "Quantity", "Time", "Stop Loss", "Profit", "Use Breakeven", "Breakeven Trigger", "Breakeven Offset", "Use Trail", "Trail Trigger", "Trail", "Instrument", "Account Number",
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
                    accountNumbers[index] || "-",
                ].join(",")
            );
        });

        return tradeCSV.join("\n");
      };

      const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      };

      const promptDownloadConfirmation = () => {
        if (!downloadConfirmed && !downloadCancelled) {
            const shouldDownload = window.confirm("Do you want to download all CSV files?");
            
            if (shouldDownload) {
                downloadConfirmed = true;
            } else {
                downloadCancelled = true;
            }
        }
    
        // If the user confirmed, proceed with downloading all files
        if (downloadConfirmed) {
            downloadCSV(tradeCSV, `${accountFileName}`);
        }
    
        // If the user cancelled, skip download and exit the loop
        if (downloadCancelled) {
            // console.log("Download cancelled by the user.");
        }
      };

      if (selectedAccounts.length === 0) {
        for (let accountString of uniqueAccountNumbers) { 
          // Temporarily update selectedAccounts without immediately using state
          newSelectedAccounts = [...selectedAccounts, accountString];

          const tableData = createTableDataForOneAccount();

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

          const accountTrades = tableData.map((row) => ({
              trade: tradesData.find((trade) => trade.TradeName === row.trade),
              accountNumber: row.account,
              direction: row.direction,
          })).filter((item) => item.trade);

          const tradeCSV = createTradeCSV(
              accountTrades.map((item) => item.trade),
              accountString.replace(/APEX-/, "").split(" ")[0],
              accountTrades.map((item) => item.accountNumber),
              accountTrades.map((item) => item.direction)
          );

          let accountFileName = `${accountString.replace(/APEX-/, "").split(" ")[0]}_Trades.csv`;

          if(selectedFilters.PA){
              accountFileName = `${accountString.replace(/APEX-/, "").split(" ")[0]}_PA.csv`;
          }
          
          if(selectedFilters.EVAL){
              accountFileName = `${accountString.replace(/APEX-/, "").split(" ")[0]}_EVAL.csv`;
          }

          promptDownloadConfirmation();  // Check for confirmation to download
          await saveCSVToBackend(tradeCSV, `${accountFileName}`, accountString.replace(/APEX-/, "").split(" ")[0]);
        }
        return;
      } else {
        const tableData = createTableDataForOneAccount();
        // console.log('user data: ',selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]);

        const tableHeaders = [
            `Trade (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
            `Direction (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
            `Account (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`,
            `Account Balance (${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]})`
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

        const accountTrades = tableData.map((row) => ({
            trade: tradesData.find((trade) => trade.TradeName === row.trade),
            accountNumber: row.account,
            direction: row.direction,
        })).filter((item) => item.trade);

        const tradeCSV = createTradeCSV(
            accountTrades.map((item) => item.trade),
            selectedAccounts[0].replace(/APEX-/, "").split(" ")[0],
            accountTrades.map((item) => item.accountNumber),
            accountTrades.map((item) => item.direction)
        );

        let accountFileName = `${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]}_Trades.csv`;

        if(selectedFilters.PA){
            accountFileName = `${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]}_PA.csv`;
        }
        
        if(selectedFilters.EVAL){
            accountFileName = `${selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]}_EVAL.csv`;
        }

        promptDownloadConfirmation();  // Check for confirmation to download
        await saveCSVToBackend(tradeCSV, `${accountFileName}`, selectedAccounts[0].replace(/APEX-/, "").split(" ")[0]);
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
          alert("Error uploading file:", error);
      }
      fetchFileCreationTime();
  };

  const handleFilterChange = (filter) => {
    setSelectedFilters((prevFilters) => {
      // If the 'EVAL' checkbox is clicked, uncheck 'PA'
      if (filter === "EVAL") {
        return { EVAL: !prevFilters.EVAL, PA: false };
      }
  
      // If the 'PA' checkbox is clicked, uncheck 'EVAL'
      if (filter === "PA") {
        return { EVAL: false, PA: !prevFilters.PA };
      }
  
      return prevFilters;
    });
  };

  const handleAccountSelection = (account) => {
    // If the account is already selected, unselect it (clear selection)
    if (selectedAccounts.includes(account)) {
      setSelectedAccounts([]); // Clear selection
    } else {
      // If not selected, select the new account and clear any previous selection
      setSelectedAccounts([account]); // Replace previous selection with the new account
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
    
      <p className="text-lg font-semibold text-gray-600">{formattedTodayDate}</p> 
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
                 {/* Filters */}
                  <div className="flex space-x-4 mb-4">
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
                    <div>
                      <Dropdown
                        label={
                          selectedAccounts.length > 0
                            ? selectedAccounts.map((account) => account.replace(/APEX-/, "")) // Remove "APEX-"
                                .join(", ")
                            : "Select User"
                        }
                        className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
                        inline
                      >
                        {/* Clear Selection option */}
                        <Dropdown.Item onClick={() => setSelectedAccounts([])}>
                          Clear Selection
                        </Dropdown.Item>

                        {/* Iterate over uniqueAccountNumbers and allow only one selection */}
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
                    </div>
                  </div>

                  
                  <div className="flex items-center space-x-4 mt-4">
                    {!isFindingMatch && (
                      <>
                        {/* Find Match Button */}
                        <Button
                          gradientDuoTone="greenToBlue"
                          onClick={exportCSVForEachAccount}
                          className="flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          <HiPlusCircle className="mr-3 text-2xl" /> {/* Adjust icon size here */}
                          Create New Trade Data Signals
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
                  <Table hoverable className="shadow-md w-full">
                      <TableHead>
                        <TableHeadCell>#</TableHeadCell>
                        <TableHeadCell>File Name</TableHeadCell>
                        <TableHeadCell>Creation Time</TableHeadCell>
                      </TableHead>
                      <TableBody>
                          {Array.isArray(fileCreationData) ? (
                            fileCreationData
                              .filter(file => {
                                // Ensure selectedAccounts is defined and not null
                                const userNumber = selectedAccounts?.[0]?.replace(/APEX-/, "").split(" ")[0];
                                
                                // If userNumber is available and file matches the pattern
                                if (userNumber) {
                                  const fileNumber = file.fileName.match(/\d+/)?.[0]; // Extract the first number from the file name
                                  return /(_PA|_EVAL|_Trades)/.test(file.fileName) && fileNumber === userNumber;
                                }
                                
                                // If selectedAccounts is null or userNumber is not found, show all files matching the pattern
                                return /(_PA|_EVAL|_Trades)/.test(file.fileName);
                              })
                              .map((file, index) => (
                                <TableRow key={index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>{file.fileName}</TableCell>
                                  <TableCell>{new Date(file.createdAt).toLocaleString()}</TableCell> {/* Format the creation time */}
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="3">No data available</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                    </Table>
                  </div>    
              </>
          )}
        </>
      )}    
    </div>
  )
}