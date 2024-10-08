import { React, useState, useRef, useEffect, useCallback } from "react";
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
} from "flowbite-react";
import {
  HiOutlineExclamationCircle,
  HiPlusCircle,
  HiUserAdd,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import axios from "axios";
import { CSVLink } from "react-csv";

const BaseURL = import.meta.env.VITE_BASE_URL;

const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

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
  data.forEach((item) => {
    const accountName = item.name;
    if (!accountColors[accountName]) {
      accountColors[accountName] = generateRandomColor();
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

  const deleteAllAccounts = async () => {
    if (
      window.confirm("Are you sure you want to delete all account details?")
    ) {
      try {
        const token = currentUser.token; // Get the token from the currentUser object

        const headers = {
          Authorization: `Bearer ${token}`, // Pass token in the Authorization header
        };

        await axios.delete(`${BaseURL}accountDetails/`, { headers }); // Send headers with the delete request
        alert("All account details deleted successfully.");
        
        setCombinedData([]); // Clear the data in the frontend after deletion
        setFilteredData([]); // Clear the filtered data as well
      } catch (error) {
        console.error("Error deleting all accounts:", error);
        alert("Failed to delete all accounts.");
      }
    }
  };

  const clearSets = () => {
    setSetsData([]); // Reset the sets data to an empty array
  };

  const makeSets = () => {
    const groupedAccounts = {};

    // Group accounts by user name
    filteredData.forEach((account) => {
      if (!groupedAccounts[account.name]) {
        groupedAccounts[account.name] = [];
      }
      groupedAccounts[account.name].push(account);
    });

    const sets = [];
    const numRowsPerAccount = 4; // Number of rows per account

    // Get the maximum number of accounts for a user
    const maxGroupSize = Math.max(
      ...Object.values(groupedAccounts).map((group) => group.length)
    );

    // Create sets by appending each user's accounts in the desired order
    for (let i = 0; i < maxGroupSize; i++) {
      Object.keys(groupedAccounts).forEach((user) => {
        const userAccounts = groupedAccounts[user];
        // Add the specified number of rows for each account if available
        for (let j = 0; j < numRowsPerAccount; j++) {
          const accountIndex = i * numRowsPerAccount + j;
          if (userAccounts[accountIndex]) {
            sets.push(userAccounts[accountIndex]);
          }
        }
      });
    }

    setSetsData(sets);
  };

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
  }, []);

  const debouncedApplyFilters = useCallback(
    debounce(
      () => {
        const filteredCombinedData = applyFilters(
          combinedData,
          accountFilter,
          isAdminOnly,
          isPAaccount,
          isEvalAccount,
          selectedProcessRange,
          processRanges
        );
        setFilteredData(filteredCombinedData);

        const filteredSetsData = applyFilters(
          setsData,
          accountFilter,
          isAdminOnly,
          isPAaccount,
          isEvalAccount,
          selectedProcessRange,
          processRanges
        );
        setSetsData(filteredSetsData);
      },
      300 // 300ms delay
    ),
    [
      accountFilter,
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
    accountFilter,
    isAdminOnly,
    isPAaccount,
    isEvalAccount,
    selectedProcessRange,
    processRanges
  ) => {
    let filtered = data;

    // Apply account filter
    if (accountFilter) {
      filtered = filtered.filter(
        (item) => `${item.accountNumber} (${item.name})` === accountFilter
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

  const handleFileChange = (e) => {
    setCsvFiles(e.target.files);
  };

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
    if (accountFilter) {
      const accountName = accountFilter.split(" ");
      fileName += `-${accountName}`;
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

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="#" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Account Details</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
        All Account Details | Updated At: {formattedDateTime && `(${formattedDateTime})`}
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

          <div className="flex gap-3 justify mt-4">
            <select
              id="accountFilter"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="block w-1/6 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">Select Account</option>
              {uniqueAccountNumbers.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
            <select
              id="processCsv"
              value={selectedProcessRange}
              onChange={(e) => setSelectedProcessRange(e.target.value)}
              className="block w-1/8 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">Select Range</option>
              {processRanges.map((range) => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            <div className="flex gap-5 items-center">
              <label className="flex items-center">
                <Checkbox
                  checked={isAdminOnly}
                  onChange={(e) => setIsAdminOnly(e.target.checked)}
                  className="mr-2"
                />
                Show Admin Only
              </label>

              <label className="flex items-center">
                <Checkbox
                  checked={isPAaccount}
                  onChange={(e) => setIsPAaccount(e.target.checked)}
                  className="mr-2"
                />
                Show PA Accounts Only
              </label>

              <label className="flex items-center">
                <Checkbox
                  checked={isEvalAccount}
                  onChange={(e) => setIsEvalAccount(e.target.checked)}
                  className="mr-2"
                />
                Show Eval Accounts Only
              </label>
            </div>
                {/* add csvs here */}
            {currentUser.user.role === "admin" && (
              <Button
                gradientDuoTone="greenToBlue"
                onClick={uploadCsvs}
                disabled={createLoding}
              >
                {createLoding ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading...</span>
                  </>
                ) : (
                  <>
                    <HiPlusCircle className="mr-2 h-4 w-4" />
                    Upload CVSs
                  </>
                )}
              </Button>
            )}
            <CSVLink
              {...exportCsv()}
              className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 text-white rounded-md px-4 py-2 hover:bg-green-600"
            >
              Export CSV
            </CSVLink>
            <Button
              gradientDuoTone="purpleToBlue"
              onClick={makeSets}
              disabled={!!accountFilter}
            >
              Make Sets
            </Button>
            <Button
              gradientDuoTone="purpleToPink"
              onClick={clearSets}
              disabled={!!accountFilter}
            >
              Clear Sets
                </Button>
                {currentUser.user.role === "admin" && (
                <Button gradientMonochrome="failure" onClick={deleteAllAccounts}>
                  Delete All
                </Button>
                )}
          </div>

          {createLoding ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
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
                  {setsData.length > 0
                    ? setsData.map((account, index) => {
                        const backgroundColor = accountColors[account.name];
                        const luminance = getLuminance(backgroundColor);
                        const textColor =
                          luminance > 160 ? "#000000" : "#FFFFFF";

                        return (
                          <TableRow
                            key={account.id}
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
                                $ {account.accountBalance}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{account.name}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{account.status}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">
                                {account.trailingThreshold}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{account.PnL}</p>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    : filteredData.map((account, index) => {
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
                                $ {account.accountBalance}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{account.name}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{account.status}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">
                                $ {account.trailingThreshold}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold">{account.PnL}</p>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </>
          )}
        </>
      )}
    </div>
  );
}
