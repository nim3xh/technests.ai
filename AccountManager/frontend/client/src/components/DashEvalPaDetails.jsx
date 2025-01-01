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
  Checkbox,
  Button,
  Modal,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import React, { useState ,useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { HiHome } from "react-icons/hi";
import useRealTimeDate from '../hooks/useRealTimeDate'
import { formatBalance } from "./utils/formatBalance";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashEvalPaDetails() {
  const { currentUser } = useSelector((state) => state.user);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
      EVAL: false,
      PA: false,
  });

  const formattedTodayDate = useRealTimeDate(); // Get the current date

  const ranges = {
    PA: [
      "<49000",
      "49000-50000",
      "50000-50500",
      "50500-51000",
      "51000-51500",
      "51500-52000",
      "52000-52500",
      "52500-52600",
      "52600-52700",
      "52700-52800",
      "52800-52900",
      "52900-53000",
      "53000-53100",
    ],
    EVAL: [
      "<48000",
      "<49000",
      "<50000",
      "<51000",
      "<52000",
      "<53000",
      ">53000",
    ],
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

      // Assuming accountDetailsResponse.data is an array of account objects
      const activeAccounts = accountDetailsResponse.data.filter(account => account.status === "active");

      const mergedData = mergeData(
        usersResponse.data,
        activeAccounts
      );
      setCombinedData(mergedData);

      setLoading(false);
    } catch (err) {
      setError("Something went wrong while fetching data.",err);
      setLoading(false);
    }
  };

  const getAccountsByRange = (range, type) => {
    const [min, max] = range.replace(/[<>]/g, "").split("-").map((value) => parseFloat(value));
  
    // If neither EVAL nor PA is selected, return all accounts
    if (!selectedFilters.EVAL && !selectedFilters.PA) {
      return combinedData.filter((account) => {
        const balance = account.accountBalance;
        // Check for all possible ranges
        return balance >= min && balance <= max;
      });
    }
    
    return combinedData.filter((account) => {
      const balance = account.accountBalance;
      const isEval = account.account.startsWith("APEX");
      const isPA = account.account.startsWith("PA");
  
      // If EVAL is selected, check for EVAL accounts
      if (selectedFilters.EVAL && !isEval) return false;
      
      // If PA is selected, check for PA accounts
      if (selectedFilters.PA && !isPA) return false;
      
      // For range check
      if (range.includes("<")) return balance < min;
      if (range.includes(">")) return balance > min;
      return balance >= min && balance <= max;
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
    setSelectedAccounts((prevSelected) =>
      prevSelected.includes(account)
        ? prevSelected.filter((acc) => acc !== account) // Remove if already selected
        : [...prevSelected, account] // Add if not selected
    );
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
               Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Eval & PA details</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
        Eval & PA details
      </h1>
      <p className="text-lg font-semibold text-gray-600 dark:text-white">{formattedTodayDate}</p> {/* Display the formatted date */}
      {currentUser.user.role !== "user" && (
        <>
          {loading ? (
             <div className="flex justify-center items-center h-96">
                <Spinner size="xl" />
             </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ):(
            <>
              <div className="text-center">
                <div>
                  <div className="flex flex-col md:flex-row justify-left items-center md:space-x-4 mt-2">
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
                      <Dropdown
                          label={
                            selectedAccounts.length > 0
                              ? selectedAccounts.map((acc) => acc.replace(/APEX-/, "")).join(", ") // Show selected accounts without "APEX-"
                              : "Select Users"
                          }
                          className="w-full text-left dark:bg-gray-800 dark:text-gray-200 relative z-20"
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
                              {selectedAccounts.includes(account) ? "✓ " : ""}{" "}
                              {account.replace(/APEX-/, "")} {/* Display without "APEX-" */}
                            </Dropdown.Item>
                          ))}
                      </Dropdown>
                    </div>      
                  </div>
                  <div className="mt-4">
                  <Table hoverable className="shadow-md w-full border-collapse border border-gray-500">
                    <TableHead>
                      <TableHeadCell className="text-center border border-gray-500 text-black">
                        Range
                      </TableHeadCell>
                      {/* Dynamically create columns for each user */}
                      {selectedAccounts.length > 0 &&
                        selectedAccounts.map((account, idx) => (
                          <TableHeadCell key={idx} className="text-left border border-gray-500 text-black">
                            {account.replace(/.*\((.*)\)/, "$1").split(" ")[0]} {/* Extract and display only the first name */}
                          </TableHeadCell>
                        ))}
                      {selectedAccounts.length === 0 &&
                        uniqueAccountNumbers.map((account, idx) => (
                          <TableHeadCell key={idx} className="text-left border border-gray-500 text-black">
                            {account.replace(/.*\((.*)\)/, "$1").split(" ")[0]} {/* Extract and display only the first name */}
                          </TableHeadCell>
                        ))}
                    </TableHead>
                    <TableBody>
                      {ranges[selectedFilters.EVAL ? "EVAL" : "PA"].map((range, idx) => {
                        const accounts = getAccountsByRange(range, selectedFilters.EVAL ? "EVAL" : "PA");

                        // Create a set to track unique account numbers within the range
                        const accountsInRange = new Set();
                        accounts.forEach((account) => accountsInRange.add(account.accountNumber));

                        return (
                          <TableRow
                            key={idx}
                            style={{
                              backgroundColor: accounts.length
                                ? `hsl(${(idx * 50) % 360}, 70%, 90%)`
                                : "white",
                            }}
                          >
                            {/* Center-align the range */}
                            <TableCell className="text-center border border-gray-500 text-black">{range}</TableCell>

                            {/* Display accounts for each user in their respective columns */}
                            {selectedAccounts.length > 0 &&
                              selectedAccounts.map((account, idx) => {
                                const accountNumber = "APEX-" + account.split(" ")[0].replace("APEX-", "");
                                const isAccountInRange = accountsInRange.has(accountNumber); // Check if the account is in this range
                                return (
                                  <TableCell
                                    key={idx}
                                    className="text-left border border-gray-500 text-black"
                                    style={{
                                      verticalAlign: 'top',
                                      maxWidth: '200px', // Adjust based on your content length
                                      overflow: 'hidden', // Hide overflowing text
                                      textOverflow: 'ellipsis', // Display ellipsis if the content overflows
                                    }}
                                  >
                                    {isAccountInRange
                                      ? accounts
                                          .filter((acc) => acc.accountNumber === accountNumber)
                                          .map((acc, i) => (
                                            <div 
                                              key={i} 
                                              title={`${formatBalance(acc.accountBalance - acc.trailingThreshold)}`}
                                            >
                                              {acc.account}
                                            </div>
                                          ))
                                      : null}
                                  </TableCell>
                                );
                              })}

                            {selectedAccounts.length === 0 &&
                              uniqueAccountNumbers.map((account, idx) => {
                                const accountNumber = "APEX-" + account.split(" ")[0].replace("APEX-", "");
                                const isAccountInRange = accountsInRange.has(accountNumber); // Check if the account is in this range
                                return (
                                  <TableCell
                                    key={idx}
                                    className="text-left border border-gray-500 text-black"
                                    style={{
                                      verticalAlign: 'top',
                                      maxWidth: '200px', // Adjust based on your content length
                                      overflow: 'hidden', // Hide overflowing text
                                      textOverflow: 'ellipsis', // Display ellipsis if the content overflows
                                      whiteSpace: 'nowrap', // Prevent text wrapping
                                    }}
                                  >
                                    {isAccountInRange
                                      ? accounts
                                          .filter((acc) => acc.accountNumber === accountNumber)
                                          .map((acc, i) => (
                                            <div 
                                              key={i} 
                                              title={`${formatBalance(acc.accountBalance - acc.trailingThreshold)}`}
                                            >
                                              {acc.account}
                                            </div>
                                          ))
                                      : null}
                                  </TableCell>
                                );
                              })}
                          </TableRow>
                        );
                      })}
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
  )
}
