import {
  React,
  useState,
  useEffect,
  useCallback,
} from "react";
import { HiHome } from "react-icons/hi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Avatar,
  Button,
  Breadcrumb,
  Checkbox,
  Spinner,
  Dropdown,
  Tooltip,
} from "flowbite-react";
import { useSelector } from "react-redux";
import { debounce, set } from "lodash";
import axios from "axios";
import { CSVLink } from "react-csv";
import { MdAccountBalance, MdPerson, MdTableRows } from "react-icons/md";
import useRealTimeDate from '../hooks/useRealTimeDate';

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashAccountDetails() {
  const [createLoding, setCreateLoding] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [combinedData, setCombinedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csvFiles, setCsvFiles] = useState([]);
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [isPAaccount, setIsPAaccount] = useState(false);
  const [isEvalAccount, setIsEvalAccount] = useState(false);
  const [selectedProcessRange, setSelectedProcessRange] = useState("");
  const [paAccountsCount, setPaAccountsCount] = useState(0);
  const [nonPaAccountsCount, setNonPaAccountsCount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [setsData, setSetsData] = useState([]);
  const [createdDateTime, setCreatedDateTime] = useState("");
  const [setsMade, setSetsMade] = useState(false); // State to toggle between buttons
  const [showSetsData, setShowSetsData] = useState(false); // State to control the visibility of setsData table
  const [tradesData, setTradesData] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [runningTrades, setRunningTrades] = useState({}); // Stores running states for each account
  const [elapsedTimes, setElapsedTimes] = useState({}); // Stores time elapsed for each account
  const [isCompared, setIsCompared] = useState(false); 
  let [paStats, setPaStats] = useState({
    PA1: 0,
    PA2: 0,
    PA3: 0,
    PA4: 0,
  });

  const formattedTodayDate = useRealTimeDate();

  const processRanges = [
    { label: "47000", min: 46750, max: 47249 },
    { label: "47500", min: 47250, max: 47749 },
    { label: "48000", min: 47750, max: 48249 },
    { label: "48500", min: 48250, max: 48749 },
    { label: "49000", min: 48750, max: 49249 },
    { label: "49500", min: 49250, max: 49749 },
    { label: "50000", min: 49750, max: 50249 },
    { label: "50500", min: 50500, max: 50749 },
    { label: "51000", min: 50750, max: 51249 },
    { label: "51500", min: 51250, max: 51749 },
    { label: "52000", min: 51750, max: 52249 },
    { label: "52500", min: 52250, max: 52749 },
    { label: "53000", min: 52750, max: 53249 },
    { label: "53500", min: 53250, max: 53749 },
    { label: "54000", min: 53750, max: 54249 },
    { label: "54500", min: 54250, max: 54749 },
    { label: "55000", min: 54750, max: 55249 },
  ];

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
    fetchData();
    fetchTradeData();
  }, []);

  const debouncedApplyFilters = useCallback(
    debounce(() => {
      const filteredCombinedData = applyFilters(
        combinedData,
        selectedAccounts,
        selectedAccount, // Pass selectedAccounts
        isAdminOnly,
        isPAaccount,
        isEvalAccount,
        selectedProcessRange,
        processRanges
      );
      setFilteredData(filteredCombinedData);
    }, 300), // 300ms delay
    [
      selectedAccounts, // Update dependency
      selectedAccount,
      selectedProcessRange,
      combinedData,
      isAdminOnly,
      isPAaccount,
      isEvalAccount,
      setsData,
    ]
  );

  // Helper function to apply filters
  const applyFilters = (
    data,
    selectedAccounts,
    selectedAccount,
    isAdminOnly,
    isPAaccount,
    isEvalAccount,
    selectedProcessRange,
    processRanges
  ) => {
    let filtered = data;

    // Apply account filter for multiple accounts
    if (selectedAccounts.length > 0) {
      filtered = filtered.filter((item) =>
        selectedAccounts.includes(`${item.accountNumber} (${item.name})`),
      );
    }
    
    if(selectedAccount != null){
      filtered = filtered.filter((item) =>
        selectedAccount.includes(`${item.accountNumber} (${item.name})`)
      );
    }

    // Filter for admin status
    if (isAdminOnly) {
      filtered = filtered.filter((item) => item.status === "admin only");
    } else {
      filtered = filtered.filter((item) => item.status !== "admin only");
    }

    // Filter accounts that start with "PA"
    if (isPAaccount) {
      filtered = filtered.filter((item) => item.account.startsWith("PA"));
    }

    // Filter accounts that start with "APEX"
    if (isEvalAccount) {
      filtered = filtered.filter((item) => item.account.startsWith("APEX"));
    }

    // Filter by selected process range
    if (selectedProcessRange) {
      const selectedRange = processRanges.find(
        (range) => range.label === selectedProcessRange
      );
      filtered = filtered.filter(
        (item) =>
          item.accountBalance >= selectedRange.min &&
          item.accountBalance <= selectedRange.max
      );
    }

    return filtered;
  };

  useEffect(() => {
    debouncedApplyFilters();
    return debouncedApplyFilters.cancel; // Cleanup debounce on unmount
  }, [debouncedApplyFilters]);

  const uploadCsvs = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv"; // Accept only CSV files
    input.multiple = true; // Allow multiple file selection

    input.onchange = async (event) => {
      const csvFiles = event.target.files; // Get selected files
      const formData = new FormData();
      for (const file of csvFiles) {
        formData.append("csvFiles", file);
      }
      setCreateLoding(true);

      try {
        const token = currentUser.token; // Get the token from the currentUser object

        await Promise.all([
          axios.post(`${BaseURL}accountDetails/add-accounts`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // Add token in headers for authentication
            },
          }),
          axios.post(`${BaseURL}users/add-users`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // Add token in headers for authentication
            },
          }),
        ]);

        setCreateLoding(false);
        alert("CSV uploaded successfully!");

        // Refetch data after uploading CSVs
        fetchData();
        setCsvFiles([]); // Clear selected files after upload
      } catch (error) {
        console.error("Error uploading CSVs:", error);
        alert("Failed to upload CSV files.");
        setCreateLoding(false);
      }
    };

    input.click(); // Trigger the file input dialog
  };

  const fetchData = async () => {
    try {
      const token = currentUser.token; // Get the token from the currentUser object

      const headers = {
        Authorization: `Bearer ${token}`, // Add token in the Authorization header
      };

      const [usersResponse, accountDetailsResponse] = await Promise.all([
        axios.get(`${BaseURL}users`, { headers }), // Pass headers with the token
        axios.get(`${BaseURL}accountDetails`, { headers }), // Pass headers with the token
      ]);

      const mergedData = mergeData(
        usersResponse.data,
        accountDetailsResponse.data
      );
      setCombinedData(mergedData);
      // Check if mergedData is not empty and set createdDateTime from the first item's createdAt
      if (mergedData.length > 0) {
        setCreatedDateTime(mergedData[0].createdAt);
      } else {
        // Handle the case when mergedData is empty, if needed
        setCreatedDateTime(null); // or set it to a default value
      }
      setFilteredData(mergedData);

       // Initialize PA account statistics
       const paStats = {
        PA1: 0,
        PA2: 0,
        PA3: 0,
        PA4: 0,
      };

      // Categorize and count PA accounts based on account balance
      mergedData.forEach((account) => {
        if (account.account.startsWith("PA") && account.status !== "admin only") {
          const balance = parseFloat(account.accountBalance);
          if ( balance > 53000 ) paStats.PA1++;
          else if ( balance > 56000) paStats.PA2++;
          else if ( balance > 59000) paStats.PA3++;
          else if ( balance > 62000) paStats.PA4++;
        }
      });

      setPaStats(paStats); 

      setLoading(false);

      // Count PA and non-PA accounts
      const paCount = mergedData.filter((item) =>
        item.account.startsWith("PA") && !item.status.startsWith("admin")
      ).length;

      const nonPaCount = mergedData.filter((item) =>
        item.account.startsWith("APEX") && !item.status.startsWith("admin")
      ).length;


      setPaAccountsCount(paCount);
      setNonPaAccountsCount(nonPaCount);

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

      setUserStats(userStatsArray); // Update userStats state
    } catch (err) {
      setError("Something went wrong while fetching data.",err);
      setLoading(false);
    }
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

  // Calculate total number of accounts and rows
  const totalAccounts = uniqueAccountNumbers.length;
  const totalRows = filteredData.length;

  useEffect(() => {
    const newPaStats = { PA1: 0, PA2: 0, PA3: 0, PA4: 0 };
  
    filteredData.forEach((account) => {
      if (account.account.startsWith("PA") && account.status !== "admin only") {
        const balance = parseFloat(account.accountBalance);
        if ( balance > 53000 ) newPaStats.PA1++;
        else if ( balance > 56000) newPaStats.PA2++;
        else if ( balance > 59000) newPaStats.PA3++;
        else if ( balance > 62000) newPaStats.PA4++;
      }
    });
  
    setPaStats(newPaStats);

    // Calculate statistics for each user
    const stats = {};
    let totalEvalActive = 0;
    let totalPAActive = 0;
    let totalEvalAdminOnly = 0;
    let totalPAAdminOnly = 0;

    filteredData.forEach((item) => {
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

    setUserStats(userStatsArray); // Update userStats state
  }, [filteredData]);

  // Calculate unique accounts from filteredData
  const uniqueAccountsInFilteredData = new Set(
    filteredData.map((item) => `${item.accountNumber} (${item.name})`)
  );
  const totalUniqueAccountsDisplayed = uniqueAccountsInFilteredData.size;

  const generateCsvFilename = () => {
    let fileName = selectedProcessRange ? selectedProcessRange + "-all" : "all";

    // Include filters in the filename
    if (selectedAccounts.length > 0) {
      const accountNames = selectedAccounts.join("_"); // Join selected accounts with an underscore
      fileName += `-${accountNames}`;
    }

    if (isAdminOnly) {
      fileName += `-admin`;
    }
    if (isPAaccount) {
      fileName += `-PA`;
    }
    if (isEvalAccount) {
      fileName += `-eval`;
    }

    return `${fileName}.csv`;
  };

  const exportCsv = () => {
    // Choose between filteredData or setsData
    const dataToExport = setsData.length > 0 ? setsData : filteredData;

    const csvData = dataToExport.map((account) => ({
      Account: account.account,
      AccountBalance: account.accountBalance,
      AccountName: `${account.accountNumber} (${account.name})`,
      Status: account.status,
      // TrailingThreshold: account.trailingThreshold,
      // PnL: account.PnL,
    }));

    const headers = [
      { label: "Account", key: "Account" },
      { label: "Account Balance", key: "AccountBalance" },
      { label: "Account Name", key: "AccountName" },
      { label: "Status", key: "Status" },
      // { label: "Trailing Threshold", key: "TrailingThreshold" },
      // { label: "PnL", key: "PnL" },
    ];

    return { data: csvData, headers, filename: generateCsvFilename() };
  };

  const formattedDateTime = createdDateTime
    ? new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        weekday: 'short', // Optional, for full weekday names like Mon, Tue
        year: 'numeric',
        month: 'short',  // Optional, short month names like Jan, Feb
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,  // Use 12-hour format with AM/PM
    }).format(new Date(createdDateTime))
    : '';

  const fetchTradeData = async () => {
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
    const intervals = {};

    Object.keys(runningTrades).forEach((accountId) => {
      if (runningTrades[accountId]) {
        intervals[accountId] = setInterval(() => {
          setElapsedTimes((prevTimes) => ({
            ...prevTimes,
            [accountId]: (prevTimes[accountId] || 0) + 1,
          }));
        }, 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [runningTrades]);

  const handleAccountSelection = (account) => {
    setSelectedAccount(account);
  };

  const handleAccountSelectionCmp = (account) => {
    if (selectedAccounts.length < 2) {
      setSelectedAccounts((prevState) => [...prevState, account]);
    }
  };
  

  // Handle clearing comparison
  const handleClearComparison = () => {
    setComparisonData([]); // Clear the comparison data
    setShowSetsData(false); // Hide the comparison table
    setIsCompared(false); // Reset comparison status
    setSelectedAccounts([]); // Clear selected accounts
  };

  const handleCompare = () => {
    // Check if exactly two accounts are selected
    if (selectedAccounts.length !== 2) {
      alert('Please select two accounts for comparison.');
      return;
    }

    setIsCompared(true); // Set comparison status to true

    const [account1, account2] = selectedAccounts;

    // Fetching account data for each account
    const dataForAccount1 = filteredData
      .filter((acc) => acc.accountNumber === account1.split(" (")[0])
      .sort(
        (a, b) => parseFloat(a.accountBalance) - parseFloat(b.accountBalance)
      );

    const dataForAccount2 = filteredData
      .filter((acc) => acc.accountNumber === account2.split(" (")[0])
      .sort(
        (a, b) => parseFloat(a.accountBalance) - parseFloat(b.accountBalance)
      );

    // Prepare the comparison data
    const comparisonRows = [];
    const maxRows = Math.max(dataForAccount1.length, dataForAccount2.length);

    for (let i = 0; i < maxRows; i++) {
      const acc1 = dataForAccount1[i] || { name: account1, accountBalance: "" };
      const acc2 = dataForAccount2[i] || { name: account2, accountBalance: "" };

      comparisonRows.push({
        AccountName1: acc1.name,
        AccountNumber1: acc1.account,
        AccountBalance1: acc1.accountBalance,
        AccountName2: acc2.name,
        AccountNumber2: acc2.account,
        AccountBalance2: acc2.accountBalance,
      });
    }
    console.log(comparisonRows);
    setComparisonData(comparisonRows);
    
    setShowSetsData(true); // Show the comparison data
  };
  

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Account Details</Breadcrumb.Item>
      </Breadcrumb>
      <p className="text-lg font-semibold text-gray-600 dark:text-white">{formattedTodayDate}</p> 
      <h1 className="mt-3 mb-3 text-left font-semibold text-xl flex justify-between items-center">
        <span>
          All Account Details
        </span>
       
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="flex-wrap flex gap-4 justify-center mt-4">
            {/* Total Rows Displayed */}
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-64 w-full rounded-md shadow-md">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-gray-500 text-md uppercase">Total Rows</h3>
                        <p className="text-2xl">{totalRows}</p>
                      </div>
                      {/* <MdTableRows className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" /> */}
                    </div>
                  </div>
                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div className="">
                          <h3 className="text-gray-500 text-md uppercase">
                            Users{" "}
                          </h3>
                          <p className="text-2xl">{totalUniqueAccountsDisplayed}</p>
                        </div>
                        {/* <MdPerson className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" /> */}
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
                        {/* <MdTableRows className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" /> */}
                      </div>
                    </div>
                    <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                      <div className="flex justify-between">
                        <div>
                        <h3 className="text-gray-500 text-md uppercase">
                            PA
                          </h3>
                          <p className="text-2xl">
                          {userStats.reduce(
                            (acc, user) => acc + user.paActive,
                            0
                          )}
                          </p>
                        </div>                    
                      </div>
                    </div>

                    <Tooltip content="Balance > $53,000">
                      <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-gray-500 text-md uppercase">
                              PO1
                            </h3>
                            <p className="text-2xl">
                              {paStats.PA1}
                            </p>
                          </div>
                          {/* <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" /> */}
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip content="Balance > $56,000">
                      <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-gray-500 text-md uppercase">
                              PO2
                            </h3>
                            <p className="text-2xl">
                              {paStats.PA2}
                            </p>
                          </div>
                          {/* <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" /> */}
                        </div>
                      </div>
                    </Tooltip>
                    
                    <Tooltip content="Balance > $59,000">
                      <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md" >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-gray-500 text-md uppercase">
                              PO3
                            </h3>
                            <p className="text-2xl">
                              {paStats.PA3}
                            </p>
                          </div>
                          {/* <MdAccountBalance className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" /> */}
                        </div>
                      </div>
                    </Tooltip>
                      
                    <Tooltip content="Balance > $62,000">
                      <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-40 w-full rounded-md shadow-md">
                        <div className="flex justify-between">
                          <div title="Balance Range: 58,001 - 60,600">
                            <h3 className="text-gray-500 text-md uppercase">
                              PO4
                            </h3>
                            <p className="text-2xl">
                              {paStats.PA4}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4 mt-4">
          {currentUser.user.role === "admin" && !(createLoding || setsMade || showSetsData) && (
            <>
       
            <Dropdown
              label={
                selectedAccount
                  ? selectedAccount.replace(/APEX-/, "") // Remove "APEX-"
                  : "Select User"
              }
              className="w-full text-left dark:bg-gray-800 dark:text-gray-200 relative z-20"
              inline
              disabled={setsMade || showSetsData}
            >
              <Dropdown.Item onClick={() => setSelectedAccount(null)}>
                Clear Selection
              </Dropdown.Item>
              {uniqueAccountNumbers.map((account) => (
                <Dropdown.Item
                  key={account}
                  onClick={() => handleAccountSelection(account)}
                >
                  {selectedAccount === account ? "✓ " : ""}{" "}
                  {account.replace(/APEX-/, "")} {/* Display without "APEX-" */}
                </Dropdown.Item>
              ))}
            </Dropdown>

            <Dropdown
                label={selectedProcessRange || "Select Range"}
                disabled={setsMade || showSetsData}
                className="w-1/4 dark:bg-gray-800 dark:text-gray-200 relative z-20" 
                inline
              >
                <Dropdown.Item onClick={() => setSelectedProcessRange("")}>
                  Select Range
                </Dropdown.Item>
                {processRanges.map((range) => (
                  <Dropdown.Item
                    key={range.label}
                    onClick={() => setSelectedProcessRange(range.label)}
                  >
                    {range.label}
                  </Dropdown.Item>
                ))}
              </Dropdown>

              <div className="flex gap-3 items-center">
                {[
                  {
                    label: "PA",
                    checked: isPAaccount,
                    onChange: setIsPAaccount,
                    disabled: setsMade || isAdminOnly || isEvalAccount || showSetsData,
                },
                  {
                    label: "Eval",
                    checked: isEvalAccount,
                    onChange: setIsEvalAccount,
                    disabled: setsMade || isAdminOnly || isPAaccount || showSetsData,
                  },
                  {
                    label: "Admin Only",
                    checked: isAdminOnly,
                    onChange: setIsAdminOnly,
                    disabled: setsMade || isPAaccount || isEvalAccount  || showSetsData,
                  },  
                ].map(({ label, checked, onChange, disabled }) => (
                  <label className="flex items-center" key={label}>
                    <Checkbox
                      checked={checked}
                      onChange={(e) => onChange(e.target.checked)}
                      className="mr-2"
                      disabled={disabled}
                    />
                    {label}
                  </label>
                ))}
              </div>

             
                  <Button
                    gradientDuoTone="greenToBlue"
                    onClick={uploadCsvs}
                  >
                    {createLoding ? (
                      <>
                        <Spinner size="sm" />
                        <span className="pl-3">Loading...</span>
                      </>
                    ) : (
                      <>Upload CSVs</>
                    )}
                  </Button>
                  </>
                )}


              <CSVLink
                {...exportCsv()} // assuming exportCsv() returns the data you want to export
                className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 text-white rounded-md px-4 py-2"
                hidden={createLoding || setsMade || showSetsData}  // Will disable if any of these values are true
              >
                Export CSV
              </CSVLink>


              <Dropdown
                  label={selectedAccounts[0] ? selectedAccounts[0] : "Select Account 1"}
                  className="w-full text-left dark:bg-gray-800 dark:text-gray-200 relative z-20"
                  inline
                >
                  <Dropdown.Item onClick={() => handleClearComparison()}>
                    Clear Selection
                  </Dropdown.Item>
                  {uniqueAccountNumbers.map((account) => (
                    <Dropdown.Item
                      key={account}
                      onClick={() => handleAccountSelectionCmp(account)}
                    >
                      {account}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
                
                <Dropdown
                  label={selectedAccounts[1] ? selectedAccounts[1] : "Select Account 2"}
                  className="w-full text-left dark:bg-gray-800 dark:text-gray-200 relative z-20"
                  inline
                >
                  <Dropdown.Item onClick={() => handleClearComparison()}>
                    Clear Selection
                  </Dropdown.Item>
                  {uniqueAccountNumbers.map((account) => (
                    <Dropdown.Item
                      key={account}
                      onClick={() => handleAccountSelectionCmp(account)}
                    >
                      {account}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
              {/* Compare or Clear Comparison Button */}
              <Button
                gradientDuoTone={isCompared ? "redToYellow" : "greenToBlue"} // Change the color based on comparison status
                onClick={isCompared ? handleClearComparison : handleCompare}
              >
                {isCompared ? "Clear Comparison" : "Compare both accounts"} {/* Change button text */}
              </Button>
          </div>
          {createLoding ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
             <div className="tables-container">
                <div className="w-full flex justify-center items-center mb-3 mt-5">
                      <p className="text-left text-sm md:text-base text-gray-700 dark:text-white">
                        Last Updated: 
                        <span className="font-medium text-gray-600 dark:text-white">
                          {formattedDateTime ? `(${formattedDateTime})` : 'N/A'}
                        </span>
                      </p>
                    </div>
                {/* Show filteredData table if setsData is not displayed */}
                {!showSetsData && (
                  <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
                    <div className="table-wrapper overflow-x-auto max-h-[500px]">
                      <Table hoverable className="shadow-md w-full mt-4">
                        <TableHead>
                          <TableHeadCell className="sticky top-0 bg-white z-10">#</TableHeadCell>
                          <TableHeadCell className="sticky top-0 bg-white z-10">Account</TableHeadCell>
                          <TableHeadCell className="sticky top-0 bg-white z-10">Account Balance</TableHeadCell>
                          <TableHeadCell className="sticky top-0 bg-white z-10">User ID</TableHeadCell>
                        </TableHead>
                        <TableBody>
                          {filteredData.length > 0 ? (
                            filteredData.map((account, index) => (
                              <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                      <p>{account.account}</p>
                                </TableCell>
                                <TableCell>
                                  <p>${account.accountBalance}</p>
                                </TableCell>
                                <TableCell title={account.name}>
                                  {/* <Tooltip content={account.name}> */}
                                    <span>{account.accountNumber.replace(/[^\d()]/g, '').match(/\d+/)?.[0]}</span>
                                  {/* </Tooltip> */}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center">
                                No data available for filteredData.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                 {/* Display comparison data in a table when showSetsData is true */}
                 <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
                {showSetsData && comparisonData.length > 0 && (
                  <div className="mt-4 overflow-x-auto max-h-[400px]">
                    <Table hoverable className="shadow-md w-full mt-4">
                      <TableHead>
                        <TableHeadCell className="sticky top-0 bg-white z-10">Account Number</TableHeadCell>
                        <TableHeadCell className="sticky top-0 bg-white z-10">Account Balance</TableHeadCell>
                        <TableHeadCell className="sticky top-0 bg-white z-10">Account Number</TableHeadCell>
                        <TableHeadCell className="sticky top-0 bg-white z-10">Account Balance</TableHeadCell>
                      </TableHead>
                      <TableBody>
                        {comparisonData.map((row, index) => (
                          <TableRow key={index}>
                            
                            <TableCell>{row.AccountNumber1}</TableCell>
                            <TableCell>${row.AccountBalance1}</TableCell>
                            <TableCell>${row.AccountBalance2}</TableCell>
                            <TableCell>{row.AccountNumber2}</TableCell>
                           
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}