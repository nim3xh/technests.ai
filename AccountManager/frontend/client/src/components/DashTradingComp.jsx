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
  Checkbox,
  Alert 
} from "flowbite-react";
import { HiHome, HiPlusCircle } from "react-icons/hi";
import axios from "axios";
import useRealTimeDate from '../hooks/useRealTimeDate';

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTradingComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileCreationData, setFileCreationData] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [tradesData, setTradesData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    EVAL: false,
    PA: false,
  });
  let downloadConfirmed = false;
  let downloadCancelled = false;
  const [alert , setAlert] = useState(false);
  const [stats, setStats] = useState([]);

  const accountDetails = [
      { accountNumber: "APEX-62849", name: "Sachin Suyamindra" },
      { accountNumber: "APEX-245360", name: "Reuven Benjamin Goodwin" },
      { accountNumber: "APEX-194858", name: "Sindhu Mukunda" },
      { accountNumber: "APEX-194320", name: "Lourdhu Manohar Reddy Yennam" },
      { accountNumber: "APEX-246808", name: "Yennam Joseph Inna Reddy" },
      { accountNumber: "APEX-248714", name: "Kiran Gururaj" },
      { accountNumber: "APEX-248560", name: "Rajit Subramanya" },
      { accountNumber: "APEX-244324", name: "Avanya Innovations Llc Anant Kulkarni" },
      { accountNumber: "APEX-182660", name: "Venkatesha Belavadi" },
      { accountNumber: "APEX-266734", name: "Umesh" },
      { accountNumber: "APEX-266645", name: "Nischay Gowda" },
      { accountNumber: "APEX-266751", name: "Bobby Karami" },
  ];  
    
    // Function to generate the formatted account string: "Company-ID (Name)"
    const formatAccountString = (account) => {
      return `${account.accountNumber} (${account.name})`;
    };

    // Function to split the accountDetails into groups of 3 accounts
    const groupAccountsInSets = (accounts, size) => {
      const result = [];
      for (let i = 0; i < accounts.length; i += size) {
        result.push(accounts.slice(i, i + size));
      }
      return result;
    };

    const showAlertAndProceed = () => {
      if (!selectedFilters.PA && !selectedFilters.EVAL) {
        setAlert('Neither PA nor EVAL is selected. Creating ApexID_Trade.csv files.');
        setTimeout(() => {
          setAlert('ApexID_Trade.csv has been created and uploaded successfully.');
        }, 1000);
      } else if (selectedFilters.PA && !selectedFilters.EVAL) {
        setAlert('Creating ApexID_PA.csv files.');
        setTimeout(() => {
          setAlert('ApexID_PA.csv has been created and uploaded successfully.');
        }, 1000);
      } else if (!selectedFilters.PA && selectedFilters.EVAL) {
        setAlert('Creating ApexID_EVAL.csv files.');
        setTimeout(() => {
          setAlert('ApexID_EVAL.csv has been created and uploaded successfully.');
        }, 1000);
      }
    };
  
    const selectSetsOfThreeAcc = () => {
      showAlertAndProceed();
    
      const formattedAccounts = accountDetails.map(formatAccountString);
      const groupedSets = groupAccountsInSets(formattedAccounts, 3);
    
      // Export CSV after updating selected accounts for each set
      exportCSVForEachAccount(groupedSets);
    };
    
    
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
  
        setLoading(false);
      } catch (err) {
        alert("Error fetching data:", err);
        setError("Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData();
      fetchTrades();
      fetchFileCreationTime();
    }, [BaseURL, currentUser]);


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

  // Helper function to get a random time between two given times
  const getRandomTime = (startHour, startMinute, endHour, endMinute) => {
    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    const hours = randomTime.getHours();
    const minutes = randomTime.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  // Function to get trade time based on account balance
  const getTradeTime = (accountBalance) => {
    if (accountBalance < 49000) {
      // Far Big Trades: 6:30 AM - 9:30 AM
      return getRandomTime(6, 30, 9, 30);
    } else if (accountBalance >= 49000 && accountBalance <= 52799) {
      // Standard Trades: 9:30 AM - 11:30 AM
      return getRandomTime(9, 30, 11, 30);
    } else if (accountBalance >= 52800 && accountBalance <= 53000) {
      // Mini Trade: 11:30 AM - 12:00 PM
      return getRandomTime(11, 30, 12, 0);
    } else {
      // Default case if the balance does not match any range
      return "-";
    }
  };

  // Function to determine the trade name based on account balance and account type (PA or EVAL)
  const getTradeNameBasedOnBalance = (accountType, balance) => {
    if (accountType.startsWith("APEX")) {
      if (balance >= 49000 && balance <= 52799) {
        return "EVAL STD"; // For EVAL accounts with balance between 49500 and 52801
      } else if (balance >= 52800 && balance < 53000) {
        return "EVAL Mini"; // For EVAL accounts with balance above 52800
      } else if (balance < 49500) {
        return "EVAL MAX"; // For EVAL accounts with balance below 49500
      }
    }

    // Check if the account type is "PA"
    if (accountType.startsWith("PA")) { 
      if (balance >= 49000 && balance <= 52799) {
        return "PA STD"; // For PA accounts with balance between 49000 and 52801
      } else if(balance >= 52400 && balance < 53000) {
        return "PA Mini"; // For PA accounts with balance between 52800 and 53000
      } else if (balance < 49000) {
        return "PA Max"; // For PA accounts with balance below 49000
      } else if (balance >= 52600) {
        return "PA micro"; // For PA accounts with balance 53k or more
      } else {
        return "PA micro"; // For PA accounts with balance above 53000
      }
    }
    return "-"; // Default fallback if no condition matches
  };

  const exportCSVForEachAccount = async (groupedSets) => {
      const newStats = [];
      const createTableDataForThreeAccounts = (accounts) => {
        // Filter accounts within the specified range
        let filteredAccounts = combinedData.filter(
            (account) =>
                account.status !== "admin only" &&
                accounts.includes(`${account.accountNumber} (${account.name})`) // Use `accounts` directly
        );
    
        if (selectedFilters.PA) {
          filteredAccounts = filteredAccounts.filter((item) => item.account.startsWith("PA"));
        }

        if (selectedFilters.EVAL) {
            filteredAccounts = filteredAccounts.filter((item) => item.account.startsWith("APEX"));
        }

        // Separate PA and EVAL accounts
        const paAccounts = filteredAccounts.filter((item) => item.account.startsWith("PA"));
        let evalAccounts = filteredAccounts.filter((item) => item.account.startsWith("APEX"));

        evalAccounts = evalAccounts.filter((item) => item.accountBalance < 53000);

        // Group accounts by users for PA and EVAL accounts separately
        const userAccountsPA = accounts.map((user) =>
            paAccounts.filter((account) => `${account.accountNumber} (${account.name})` === user)
        );
    
        const userAccountsEVAL = accounts.map((user) =>
            evalAccounts.filter((account) => `${account.accountNumber} (${account.name})` === user)
        );
    
        const [user1PA, user2PA, user3PA] = userAccountsPA;
        const [user1EVAL, user2EVAL, user3EVAL] = userAccountsEVAL;
    
        const matchesPA = [];
        const unmatchedAccounts1PA = [];
        const unmatchedAccounts2PA = [];
        const unmatchedAccounts3PA = [];
    
        const matchesEVAL = [];
        const unmatchedAccounts1EVAL = [];
        const unmatchedAccounts2EVAL = [];
        const unmatchedAccounts3EVAL = [];
    
        // Match PA accounts between user 1, 2, and 3
        user1PA.forEach((account1) => {
            const match = user2PA.find(
                (account2) =>
                    account1.accountNumber !== account2.accountNumber &&
                    Math.abs(account1.accountBalance - account2.accountBalance) <= 125 &&
                    !matchesPA.some((m) => m.includes(account1) || m.includes(account2))
            );
    
            if (match) {
                matchesPA.push([account1, match]);
            } else {
                unmatchedAccounts1PA.push(account1);
            }
        });
    
        unmatchedAccounts1PA.forEach((account1) => {
            const match = user3PA.find(
                (account3) =>
                    account1.accountNumber !== account3.accountNumber &&
                    Math.abs(account1.accountBalance - account3.accountBalance) <= 125 &&
                    !matchesPA.some((m) => m.includes(account1) || m.includes(account3))
            );
    
            if (match) {
                matchesPA.push([account1, match]);
            } else {
                unmatchedAccounts3PA.push(account1);
            }
        });
    
        user2PA.forEach((account2) => {
            const match = user3PA.find(
                (account3) =>
                    account2.accountNumber !== account3.accountNumber &&
                    Math.abs(account2.accountBalance - account3.accountBalance) <= 125 &&
                    !matchesPA.some((m) => m.includes(account2) || m.includes(account3))
            );
    
            if (match) {
                matchesPA.push([account2, match]);
            } else {
                unmatchedAccounts2PA.push(account2);
            }
        });
    
        // Match EVAL accounts between user 1, 2, and 3
        user1EVAL.forEach((account1) => {
            const match = user2EVAL.find(
                (account2) =>
                    account1.accountNumber !== account2.accountNumber &&
                    Math.abs(account1.accountBalance - account2.accountBalance) <= 125 &&
                    !matchesEVAL.some((m) => m.includes(account1) || m.includes(account2))
            );
    
            if (match) {
                matchesEVAL.push([account1, match]);
            } else {
                unmatchedAccounts1EVAL.push(account1);
            }
        });
    
        unmatchedAccounts1EVAL.forEach((account1) => {
            const match = user3EVAL.find(
                (account3) =>
                    account1.accountNumber !== account3.accountNumber &&
                    Math.abs(account1.accountBalance - account3.accountBalance) <= 125 &&
                    !matchesEVAL.some((m) => m.includes(account1) || m.includes(account3))
            );
    
            if (match) {
                matchesEVAL.push([account1, match]);
            } else {
                unmatchedAccounts3EVAL.push(account1);
            }
        });
    
        user2EVAL.forEach((account2) => {
            const match = user3EVAL.find(
                (account3) =>
                    account2.accountNumber !== account3.accountNumber &&
                    Math.abs(account2.accountBalance - account3.accountBalance) <= 125 &&
                    !matchesEVAL.some((m) => m.includes(account2) || m.includes(account3))
            );
    
            if (match) {
                matchesEVAL.push([account2, match]);
            } else {
                unmatchedAccounts2EVAL.push(account2);
            }
        });
    
        // Generate rows for matched accounts
        const rows = [...matchesPA, ...matchesEVAL].map(([account1, account2], i) => {
            const tradeTime = getTradeTime(account1.accountBalance); // Same time for both trades

            // Check if either account balance is >= 53000, and set both directions to "Long" if true
            const direction1 = (account1.accountBalance >= 53000) ? "Long" : (i % 2 === 0 ? "Long" : "Short");
            const direction2 = (account2.accountBalance >= 53000) ? "Long" : (direction1 === "Long" ? "Short" : "Long");
    
            return [
                {
                    direction: direction1,
                    account: account1.account,
                    balance: account1.accountBalance,
                    time: tradeTime,
                    trade: getTradeNameBasedOnBalance(account1.account, account1.accountBalance),
                },
                {
                    direction: direction2,
                    account: account2.account,
                    balance: account2.accountBalance,
                    time: tradeTime,
                    trade: getTradeNameBasedOnBalance(account2.account, account2.accountBalance),
                },
            ];
        });
    
        // Add unmatched accounts with direction and time (PA and EVAL separately)
        const unmatchedAccounts = [
            ...unmatchedAccounts1PA, ...unmatchedAccounts2PA, ...unmatchedAccounts3PA,
            ...unmatchedAccounts1EVAL, ...unmatchedAccounts2EVAL, ...unmatchedAccounts3EVAL
        ];
    
        unmatchedAccounts.forEach((account, i) => {
            const direction = i % 2 === 0 ? "Long" : "Short";
            const time = getTradeTime(account.accountBalance); // Use account.accountBalance here
            rows.push({
                direction: direction,
                account: account.account,
                balance: account.accountBalance,
                time: time,
                trade: getTradeNameBasedOnBalance(account.account, account.accountBalance),
            });
        });

         // Count stats
         const totalAccounts = filteredAccounts.length;
         const totalMatchedAccounts = matchesPA.length + matchesEVAL.length;
         const totalUnmatchedAccounts = unmatchedAccounts.length;
 
         const tradingPercentage = (totalMatchedAccounts / totalAccounts) * 100;
 
         // Collect stats for this set
         newStats.push({
             set: accounts,
             totalAccounts,
             totalMatchedAccounts,
             totalUnmatchedAccounts,
             tradingPercentage,
         });
         
        // Return all rows, flattened
        return rows.flat();
    };
    
    
    const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours, 10);
        const modifier = hour >= 12 ? "PM" : "AM";
        if (hour === 0) hour = 12; 
        else if (hour > 12) hour -= 12;
        return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
    };
      
      
      const createTradeCSV = (tradeData, accountLabel, accountNumbers, accountDirection,time) => {
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
                    convertTo12HourFormat(time[index]),
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

      const promptDownloadConfirmation =  (csvContent, filename) => {
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
            downloadCSV(csvContent, `${filename}`);
        }
    
        // If the user cancelled, skip download and exit the loop
        if (downloadCancelled) {
            // console.log("Download cancelled by the user.");
        }
      };

      if(groupedSets !== null){
        // Loop through each set of accounts
        for (const accounts of groupedSets) {
          const tableData = createTableDataForThreeAccounts(accounts);
          for (let i = 0; i < accounts.length; i++) {
              {
                  const tableHeaders = [
                      `Trade (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`,
                      `Direction (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`,
                      `Account (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`,
                      `Account Balance (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`
                  ];

                  const tableCSV = [tableHeaders.join(",")];
                  tableData.forEach((row) => {
                      tableCSV.push(
                          [
                              row.trade,
                              row.direction,
                              row.account,
                              row.balance,
                              row.time,
                          ].join(",")
                      );
                  });

                  let seenAccounts = new Set(); // Track the processed accounts

                  let filteredAccountData = tableData.filter((account) => {
                      // Extract the account number after "APEX-" and before any non-digit characters
                      const accountNumber = account.account.replace(/.*APEX-(\d+)-.*/, "$1");
                      
                      // Extract the numeric part from the input string in a similar manner
                      const filteredAccountStringFromInput = accounts[i].replace(/APEX-/, "").split(" ")[0];

                      // Create a unique identifier for the account (based on accountNumber)
                      const accountIdentifier = account.account; // Or you can use a combination of properties if needed

                      // Time validation: Check if the time is in valid format (HH:mm)
                      const timeValid = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/.test(account.time);

                      //check if the trade name is valid
                      const tradeValid = tradesData.find((trade) => trade.TradeName === account.trade);

                      // Skip the account if it's already been seen or the time is invalid
                      if (seenAccounts.has(accountIdentifier) || !timeValid  || !tradeValid) {
                          return false; // Skip this account
                      }

                      // Add the account to the set to mark it as seen
                      seenAccounts.add(accountIdentifier);
                      
                      // Return true if the account matches
                      return accountNumber === filteredAccountStringFromInput;
                  });

                  const accountTrades = filteredAccountData.map((row) => ({
                      trade: tradesData.find((trade) => trade.TradeName === row.trade),
                      accountNumber: row.account,
                      direction: row.direction,
                      time: row.time,
                  })).filter((item) => item.trade);

                  const tradeCSV = createTradeCSV(
                      accountTrades.map((item) => item.trade),
                      accounts[i].replace(/APEX-/, "").split(" ")[0],
                      accountTrades.map((item) => item.accountNumber),
                      accountTrades.map((item) => item.direction),
                      accountTrades.map((item) => item.time)
                  );

                  let accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_Trades.csv`;

                  if (selectedFilters.PA) {
                      accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_PA.csv`;
                  }
                  
                  if (selectedFilters.EVAL) {
                      accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_EVAL.csv`;
                  }
                  promptDownloadConfirmation(tradeCSV, accountFileName);  // Check for confirmation to download
                  await saveCSVToBackend(tradeCSV, `${accountFileName}`, accounts[i].replace(/APEX-/, "").split(" ")[0]);
                  setStats(newStats);
              }
            }
          }
        return;
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

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Trade</Breadcrumb.Item>
      </Breadcrumb>

      <p className="text-lg font-semibold text-gray-600 dark:text-white">{formattedTodayDate}</p>
      <div className="flex items-center justify-between mb-3"></div>

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
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <>
                  {/* Find Match Button */}
                  <Button
                    gradientDuoTone="greenToBlue"
                    onClick={selectSetsOfThreeAcc}
                    className="flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <HiPlusCircle className="mr-3 text-2xl" />
                    Create New Trade Data Signals
                  </Button>
                </>
              </div>
              {alert && (
                <Alert color="success" onDismiss={() => setAlert(false)}>
                  <span className="font-medium">Info alert!</span> {alert}
                </Alert>
              )}

              {/* Tables Section */}
              <div className="flex flex-col lg:flex-row lg:space-x-6 mt-6">
                {/* Statistics Table */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-white mb-4">
                    Trade Statistics
                  </h3>
                  <Table hoverable className="shadow-md w-full">
                    <TableHead>
                      <TableHeadCell>#</TableHeadCell>
                      <TableHeadCell>Set</TableHeadCell>
                      <TableHeadCell>Total Accounts</TableHeadCell>
                      <TableHeadCell>Trades Matched</TableHeadCell>
                      <TableHeadCell>Accounts Not Trading</TableHeadCell>
                      <TableHeadCell>Trading Percentage</TableHeadCell>
                    </TableHead>
                    <TableBody>
                      {stats.length > 0 ? (
                        stats.map((stat, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{stat.set.join(", ")}</TableCell>
                            <TableCell>{stat.totalAccounts}</TableCell>
                            <TableCell>{stat.totalMatchedAccounts}</TableCell>
                            <TableCell>{stat.totalUnmatchedAccounts}</TableCell>
                            <TableCell>{stat.tradingPercentage.toFixed(2)}%</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="6">No statistics available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* File Creation Table */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-white mb-4">
                    File Creation
                  </h3>
                  <div className="table-wrapper overflow-x-auto max-h-[550px]">
                    <Table hoverable className="shadow-md w-full">
                      <TableHead>
                        <TableHeadCell className="sticky top-0 bg-white z-10">#</TableHeadCell>
                        <TableHeadCell className="sticky top-0 bg-white z-10">File Name</TableHeadCell>
                        <TableHeadCell className="sticky top-0 bg-white z-10">Creation Time</TableHeadCell>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(fileCreationData) ? (
                          fileCreationData
                            .filter((file) => /(_PA|_EVAL|_Trades)/.test(file.fileName))
                            .map((file, index) => (
                              <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{file.fileName}</TableCell>
                                <TableCell>{new Date(file.createdAt).toLocaleString()}</TableCell>
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
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}