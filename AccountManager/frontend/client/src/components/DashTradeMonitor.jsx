import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
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
  Spinner,
  Dropdown,
} from "flowbite-react";
import useRealTimeDate from '../hooks/useRealTimeDate';
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashTradeMonitor() {
  const formattedTodayDate = useRealTimeDate();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [combinedData, setCombinedData] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const [selectedFilters, setSelectedFilters] = useState({
    EVAL: false,
    PA: false,
  });

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

      setLoading(false);
    } catch (err) {
      setError("Something went wrong while fetching data.",err);
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try{
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      // Fetch the results from /results
      const response = await axios.get(`${BaseURL}results`, { headers });

      // console.log("Results fetched:", response.data);
      setResults(response.data);
      setLoading(false);

    }catch (err) {
      setError("Something went wrong while fetching data.",err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchResults();
  }, []);

  const handleAccountSelection = (account) => {
    setSelectedAccount(account);
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
        <Breadcrumb.Item>Trade Monitor</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
      Trade Monitor
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
          ) : (
                <>
                  <div className="text-center">
                      <div>
                        <div className="flex flex-col md:flex-row justify-left items-center md:space-x-4 mt-2">
                          <Dropdown
                                label={
                                  selectedAccount
                                    ? selectedAccount.replace(/APEX-/, "") // Remove "APEX-"
                                    : "Select User"
                                }
                                className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
                                inline
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
                      </div>
                    </div>
                </>
              )}
          </>
        )}
    </div>
  );
}
