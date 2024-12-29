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
import useRealTimeDate from '../hooks/useRealTimeDate';

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
              </div>
            </>
          )}
        </>
      )}
     
    </div>
  )
}
