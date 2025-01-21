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
  Datepicker,
} from "flowbite-react";
import useRealTimeDate from '../hooks/useRealTimeDate';
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashCreatedTradeView() {
  const { currentUser } = useSelector((state) => state.user);
  const formattedTodayDate = useRealTimeDate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trades, setTrades] = useState([]);
  const [createdDateTime, setCreatedDateTime] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
      EVAL: false,
      PA: false,
  });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [combinedData, setCombinedData] = useState([]);

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

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours, 10);
    const modifier = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12; 
    else if (hour > 12) hour -= 12;
    return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
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

  const fetchTrades = async () => {
    try{
      const token = currentUser.token;

      const headers ={
        Authorization: `Bearer ${token}`
      };

      const response = await axios.get(`${BaseURL}tradeData`, { headers });
      setTrades(response.data);
      setFiltered(response.data);

      if(response.data !=  null && response.data.length > 0){
        setCreatedDateTime(response.data[0].createdAt);
      } else {
        setCreatedDateTime(null);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filter = () => {
    let filtered = trades;
    if (selectedFilters.PA) {
      filtered = filtered.filter((item) => item.Account_Number.startsWith("PA"));
    }

    if (selectedFilters.EVAL) {
      filtered = filtered.filter((item) => item.Account_Number.startsWith("APEX"));
    }

    if (selectedAccount != null) {
      filtered = filtered.filter((item) => {
        return item.Account_Number.replace(/(PA-)?(APEX-)?(\d+)(-\d+)?/, '$3') === selectedAccount.replace(/APEX-/, "").split(" ")[0];
      });
    }

    setFiltered(filtered);
  }

  useEffect(() => {
    fetchTrades();
    fetchData();
  }, []);

  useEffect(() => {
    filter();
  }, [selectedFilters,selectedAccount]);

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
    setSelectedAccount(account);
  };

  
  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Created Trades</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="mt-3 mb-3 text-left font-semibold text-xl">
      Created Trades
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
          ) :(
            <>
            <div className="w-full flex justify-between items-center mb-3 mt-5">
                 <p className="text-left text-sm md:text-base text-gray-700 dark:text-white">
                        Last Updated: 
                <span className="font-medium text-gray-600 dark:text-white">
                    {formattedDateTime ? `(${formattedDateTime})` : 'N/A'}
                </span>
              </p>
              <div className="text-center">
              <div className="flex flex-col md:flex-row justify-left items-center md:space-x-4 mt-2">
                <div className="flex items-center">
                  <Dropdown
                    label={
                    selectedAccount
                      ? selectedAccount.replace(/APEX-/, "") // Remove "APEX-"
                      : "Select User"
                    }
                    className="w-full text-left dark:bg-gray-800 dark:text-gray-200  relative z-20"
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
            <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
              <div className="table-wrapper overflow-x-auto max-h-[690px]">
               <Table hoverable className="shadow-md w-full mt-4">
               <TableHead>
                  <TableRow>
                    {/* <TableHeadCell>#</TableHeadCell> */}
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Account </TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">BO</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">BT</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Direction</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Instrument</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Profit</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Quantity</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Repeat</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Repeat Every</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Repeat Times</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Stop Loss</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Time</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Trail</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Trail Trigger</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Use Breakeven</TableHeadCell>
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Use Trail</TableHeadCell>
                  </TableRow>
                  <TableBody>
                    {filtered.map((trade, index) => (
                      <TableRow key={trade._id}>
                      {/* <TableCell>{index + 1}</TableCell> */}
                      <TableCell style={{ width: '200px', fontSize: '15px', textAlign: 'left' }}>
                        {trade.Account_Number}
                      </TableCell>
                      <TableCell>{trade.Breakeven_Offset}</TableCell>
                      <TableCell>{trade.Breakeven_Trigger}</TableCell>
                      <TableCell>{trade.Direction}</TableCell>
                      <TableCell>{trade.Instrument}</TableCell>
                      <TableCell>{trade.Profit}</TableCell>
                      <TableCell>{trade.Quantity}</TableCell>
                      <TableCell>{trade.Repeat ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{trade.Repeat_Every || 'N/A'}</TableCell>
                      <TableCell>{trade.Repeat_Times || 'N/A'}</TableCell>
                      <TableCell>{trade.Stop_Loss}</TableCell>
                      <TableCell style={{ width: '120px', fontSize: '14.5px' }}>
                        {trade.Time ? convertTo12HourFormat(trade.Time) : 'N/A'}
                      </TableCell>
                      <TableCell>{trade.Trail}</TableCell>
                      <TableCell>{trade.Trail_Trigger}</TableCell>
                      <TableCell>{trade.Use_Breakeven ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{trade.Use_Trail ? 'Yes' : 'No'}</TableCell>
                    </TableRow>                    
                    ))}
                  </TableBody>
                </TableHead>
                </Table>  
              </div>               
            </div>
            </>
          )} {/* Display the spinner only if the loading is true */}
        </>
      )} {/* Display the table only if the user is not a user */}
    </div>
  )
}
