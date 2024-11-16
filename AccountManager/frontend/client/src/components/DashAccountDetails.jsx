import {
  React,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
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
  Modal,
  Checkbox,
  Label,
  Alert,
  TextInput,
  Select,
  Spinner,
  Pagination,
  Dropdown,
} from "flowbite-react";
import { useSelector } from "react-redux";
import { debounce, set } from "lodash";
import axios from "axios";
import { CSVLink } from "react-csv";
import { IoMdSettings } from "react-icons/io";

const BaseURL = import.meta.env.VITE_BASE_URL;

const getLuminance = (hex) => {
  const rgb = parseInt(hex.substring(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance;
};

const assignColorsToAccounts = (data) => {
  const accountColors = {};
  const colors = ["#808080", "#D3D3D3"]; // Gray and light gray
  let colorIndex = 0;

  data.forEach((item) => {
    const accountName = item.name;
    if (!accountColors[accountName]) {
      accountColors[accountName] = colors[colorIndex];
      colorIndex = (colorIndex + 1) % colors.length; // Alternate between gray and light gray
    }
  });

  return accountColors;
};

export default function DashAccountDetails() {
  const [createLoding, setCreateLoding] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [combinedData, setCombinedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountFilter, setAccountFilter] = useState("");
  const [csvFiles, setCsvFiles] = useState([]);
  const [accountColors, setAccountColors] = useState({});
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [isPAaccount, setIsPAaccount] = useState(false);
  const [isEvalAccount, setIsEvalAccount] = useState(false);
  const [selectedProcessRange, setSelectedProcessRange] = useState("");
  const [paAccountsCount, setPaAccountsCount] = useState(0);
  const [nonPaAccountsCount, setNonPaAccountsCount] = useState(0);
  const [setsData, setSetsData] = useState([]);
  const [createdDateTime, setCreatedDateTime] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [setsMade, setSetsMade] = useState(false); // State to toggle between buttons
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isAdminOnlyCus, setIsAdminOnlyCus] = useState(false);
  const [isPAaccountCus, setIsPAaccountCus] = useState(false);
  const [isEvalAccountCus, setIsEvalAccountCus] = useState(false);
  const [showSetsData, setShowSetsData] = useState(false); // State to control the visibility of setsData table
  const [tradesData, setTradesData] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

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
    const fetchData = async () => {
      try {
        const token = currentUser.token; // Get the token from the currentUser object
        const headers = {
          Authorization: `Bearer ${token}`, // Add token to request headers
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

        setAccountColors(assignColorsToAccounts(mergedData));
        setLoading(false);

        // Count PA and non-PA accounts in one pass
        let paCount = 0;
        let nonPaCount = 0;
        mergedData.forEach((item) => {
          if (item.account.startsWith("PA")) {
            paCount++;
          } else {
            nonPaCount++;
          }
        });
        setPaAccountsCount(paCount);
        setNonPaAccountsCount(nonPaCount);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Something went wrong while fetching data." || err.message);
        setLoading(false);
      }
    };

    fetchData();
    fetchTradeData();
  }, []);

  const debouncedApplyFilters = useCallback(
    debounce(() => {
      const filteredCombinedData = applyFilters(
        combinedData,
        selectedAccounts, // Pass selectedAccounts
        isAdminOnly,
        isPAaccount,
        isEvalAccount,
        selectedProcessRange,
        processRanges
      );
      setFilteredData(filteredCombinedData);

      const filteredSetsData = applyFilters(
        setsData,
        selectedAccounts, // Pass selectedAccounts
        isAdminOnly,
        isPAaccount,
        isEvalAccount,
        selectedProcessRange,
        processRanges
      );
      setSetsData(filteredSetsData);
    }, 300), // 300ms delay
    [
      selectedAccounts, // Update dependency
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
    selectedAccounts, // Change this to selectedAccounts
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
        selectedAccounts.includes(`${item.accountNumber} (${item.name})`)
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

      setAccountColors(assignColorsToAccounts(mergedData));
      setLoading(false);

      // Count PA and non-PA accounts
      const paCount = mergedData.filter((item) =>
        item.account.startsWith("PA")
      ).length;
      const nonPaCount = mergedData.length - paCount;

      setPaAccountsCount(paCount);
      setNonPaAccountsCount(nonPaCount);
      
    } catch (err) {
      setError("Something went wrong while fetching data.");
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
      TrailingThreshold: account.trailingThreshold,
      PnL: account.PnL,
    }));

    const headers = [
      { label: "Account", key: "Account" },
      { label: "Account Balance", key: "AccountBalance" },
      { label: "Account Name", key: "AccountName" },
      { label: "Status", key: "Status" },
      { label: "Trailing Threshold", key: "TrailingThreshold" },
      { label: "PnL", key: "PnL" },
    ];

    return { data: csvData, headers, filename: generateCsvFilename() };
  };

  const formattedDateTime = createdDateTime
    ? new Date(createdDateTime).toLocaleString()
    : "";

  /* Customized Csv part */
  // Column definitions for the table
  const columns = useMemo(
    () => [
      { label: "Account", value: "account" },
      { label: "Account Balance", value: "accountBalance" },
      { label: "Account Name", value: "accountName" },
      { label: "Status", value: "status" },
      { label: "Trailing Threshold", value: "trailingThreshold" },
      { label: "PnL", value: "pnl" },
    ],
    []
  );

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

  // Reset selection when modal is closed
  useEffect(() => {
    if (!showModal) {
      // resetSelections();
    }
  }, [showModal]);

  const [runningTrades, setRunningTrades] = useState({}); // Stores running states for each account
  const [elapsedTimes, setElapsedTimes] = useState({}); // Stores time elapsed for each account

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
    if (selectedAccounts.includes(account)) {
      setSelectedAccounts(selectedAccounts.filter((acc) => acc !== account));
    } else {
      setSelectedAccounts([...selectedAccounts, account]);
    }
  };

  const handleCompare = () => {
    // Check if exactly two accounts are selected
    if (selectedAccounts.length !== 2) {
      console.warn("Please select exactly two accounts for comparison.");
      return; // Exit if the condition is not met
    }

    const [account1, account2] = selectedAccounts;

    // Fetching account data for each account
    const dataForAccount1 = filteredData
      .filter((acc) => acc.accountNumber === account1.split(" (")[0])
      .sort(
        (a, b) => parseFloat(a.accountBalance) - parseFloat(b.accountBalance)
      ); // Sort in ascending order

    const dataForAccount2 = filteredData
      .filter((acc) => acc.accountNumber === account2.split(" (")[0])
      .sort(
        (a, b) => parseFloat(a.accountBalance) - parseFloat(b.accountBalance)
      ); // Sort in ascending order

    // Prepare CSV data
    const csvData = [];

    // Determine max rows to handle interleaving
    const maxRows = Math.max(dataForAccount1.length, dataForAccount2.length);

    // Interleave rows: first from account1, then from account2
    for (let i = 0; i < maxRows; i++) {
      const acc1 = dataForAccount1[i] || {
        name: account1.split(" (")[0],
        account: account1.split(" (")[0],
        accountBalance: "", // Keep empty if no data
      };

      const acc2 = dataForAccount2[i] || {
        name: account2.split(" (")[0],
        account: account2.split(" (")[0],
        accountBalance: "", // Keep empty if no data
      };

      // Ensure balances are numbers or empty strings
      const balance1 =
        acc1.accountBalance !== "" ? parseFloat(acc1.accountBalance) : "";
      const balance2 =
        acc2.accountBalance !== "" ? parseFloat(acc2.accountBalance) : "";

      // Push data to CSV structure
      csvData.push({
        AccountName1: acc1.name,
        AccountNumber1: acc1.account,
        AccountBalance1: balance1,
        AccountName2: acc2.name,
        AccountNumber2: acc2.account,
        AccountBalance2: balance2,
      });
    }

    // Define headers for the CSV
    const headers = [
      { label: "Account Name (1)", key: "AccountName1" },
      { label: "Account Number (1)", key: "AccountNumber1" },
      { label: "Account Balance (1)", key: "AccountBalance1" },
      { label: "Account Balance (2)", key: "AccountBalance2" },
      { label: "Account Number (2)", key: "AccountNumber2" },
      { label: "Account Name (2)", key: "AccountName2" },
    ];

    // Generate CSV filename
    const filename = `compare-${account1.split(" (")[0]}-${
      account2.split(" (")[0]
    }.csv`;

    // Prepare CSV content
    const csvContent = [
      headers.map((header) => header.label).join(","), // CSV headers
      ...csvData.map((row) =>
        headers
          .map((header) => JSON.stringify(row[header.key] || "")) // CSV rows
          .join(",")
      ),
    ].join("\n");

    // Create and download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up

    // Reset selected accounts after comparison
    setSelectedAccounts([]);
  };

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Account Details</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
        All Account Details | Updated At:{" "}
        {formattedDateTime && `(${formattedDateTime})`}
      </h1>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="flex gap-2 justify-start">
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-56 w-full rounded-md shadow-md">
              <h4>Total Rows Displayed: {totalRows}</h4>
            </div>
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
              <h4>
                Total Unique Accounts Displayed: {totalUniqueAccountsDisplayed}
              </h4>
            </div>
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-56 w-full rounded-md shadow-md">
              <h4>Total PA Account Rows: {paAccountsCount}</h4>
            </div>
            <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-64 w-full rounded-md shadow-md">
              <h4>Total Eval Account Rows: {nonPaAccountsCount}</h4>
            </div>
          </div>

          <div className="flex gap-3 justify-between mt-4 overflow-x-auto flex-nowrap">
            <Dropdown
              label={
                selectedAccounts.length > 0
                  ? selectedAccounts.join(", ")
                  : "Select Account"
              }
              className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
              inline
            >
              <Dropdown.Item onClick={() => setSelectedAccounts([])}>
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
            <Dropdown
              label={selectedProcessRange || "Select Range"}
              disabled={setsMade}
              className="w-1/4 dark:bg-gray-800 dark:text-gray-200"
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
                  label: "Show Admin Only",
                  checked: isAdminOnly,
                  onChange: setIsAdminOnly,
                  disabled: setsMade || isPAaccount || isEvalAccount,
                },
                {
                  label: "Show PA Accounts Only",
                  checked: isPAaccount,
                  onChange: setIsPAaccount,
                  disabled: setsMade || isAdminOnly || isEvalAccount,
                },
                {
                  label: "Show Eval Accounts Only",
                  checked: isEvalAccount,
                  onChange: setIsEvalAccount,
                  disabled: setsMade || isAdminOnly || isPAaccount,
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

            {currentUser.user.role === "admin" && (
              <Button
                gradientDuoTone="greenToBlue"
                onClick={uploadCsvs}
                disabled={createLoding || setsMade}
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
            )}

            <CSVLink
              {...exportCsv()}
              className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 text-white rounded-md px-4 py-2"
            >
              Export CSV
            </CSVLink>
            <Button
              gradientDuoTone="greenToBlue"
              disabled={selectedAccounts.length !== 2}
              onClick={handleCompare} // Replace with your actual compare function
            >
              Compare both accounts
            </Button>
          </div>
          {createLoding ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              <div className="tables-container">
                {/* Show filteredData table if setsData is not displayed */}
                {!showSetsData && (
                  <Table hoverable className="shadow-md w-full mt-4">
                    <TableHead>
                      <TableHeadCell>Account</TableHeadCell>
                      <TableHeadCell>Account Balance</TableHeadCell>
                      <TableHeadCell>Account Name</TableHeadCell>
                      <TableHeadCell>Status</TableHeadCell>
                      <TableHeadCell>Trailing Threshold</TableHeadCell>
                      <TableHeadCell>PnL</TableHeadCell>
                    </TableHead>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((account, index) => {
                          const backgroundColor = accountColors[account.name];
                          const luminance = getLuminance(backgroundColor);
                          const textColor =
                            luminance > 160 ? "#000000" : "#FFFFFF";

                          return (
                            <TableRow
                              key={index}
                              style={{
                                backgroundColor,
                                color: textColor,
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    size="sm"
                                    src={account.profilePicture}
                                    alt={account.name}
                                  />
                                  <div>
                                    <p className="font-semibold">
                                      {account.account}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {account.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-semibold">
                                  ${account.accountBalance}
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="font-semibold">{account.name}</p>
                              </TableCell>
                              <TableCell>
                                <p className="font-semibold">
                                  {account.status}
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="font-semibold">
                                  ${account.trailingThreshold}
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="font-semibold">{account.PnL}</p>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            No data available for filteredData.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
