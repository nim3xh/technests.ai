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
  const [selectedDate, setSelectedDate] = useState(null);
  const [filtered,setfiltered] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [createdDateTime, setCreatedDateTime] = useState("");

  const resultsDropDown = ['Profit', 'Stop Loss', 'In-progress', 'Rejected'];

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

      if(response.data.result.length > 0){
        setCreatedDateTime(response.data.result[0].createdAt);
      } else {
        setCreatedDateTime(null);
      }

      setResults(response.data.result);
      setfiltered(response.data.result)
      setLoading(false);
    }catch (err) {
      setError("Something went wrong while fetching data.",err);
      setLoading(false);
    }
  };

  const filter = () => {
    let filtered = results;
    if(selectedFilters.PA){
      filtered = filtered.filter((item) => item.Account.startsWith("PA"));
    }

    if(selectedFilters.EVAL){
      filtered = filtered.filter((item) => item.Account.startsWith("APEX"));
    }

    if(!selectedFilters.PA && !selectedFilters.EVAL){
      filtered = filtered;
    }

    if (selectedAccount != null) {
      filtered = filtered.filter((item) => {
        return item.Account.replace(/(PA-)?(APEX-)?(\d+)(-\d+)?/, '$3') === selectedAccount.replace(/APEX-/, "").split(" ")[0];
      });
    }

    if (selectedResult != null) {
      if(selectedResult === 'In-progress'){
        filtered = filtered.filter((item) => item.ExitTime === null);
      }
      else{
        filtered = filtered.filter((item) => item.Result === selectedResult);
      } 
    }

    setfiltered(filtered);
  }

  useEffect(() => {
    fetchData();
    fetchResults();

    // Set up an interval to fetch results every 15 minutes (15 * 60 * 1000 ms)
    const intervalId = setInterval(fetchResults, 15 * 60 * 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(()=> {
    filter();
  },[selectedFilters,selectedAccount,selectedResult]);

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log("Selected Date: ", date); // You can use this date in your fetch function or any logic
  };

  const handleResultSelection = (result) => {
    setSelectedResult(result);
    // Additional logic for filtering based on the selected result can go here
  };

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours, 10);
    const modifier = hour >= 12 ? "PM" : "AM";
    if (hour === 0) hour = 12; 
    else if (hour > 12) hour -= 12;
    return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
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

  const getColorClass = (result) => {
    switch (result) {
      case 'Profit':
        return 'bg-green-500 text-white'; // Softer green for Profit
      case 'Stop Loss':
        return 'bg-red-500 text-white'; // Softer red for Stop Loss
      case 'In-progress':
        return 'bg-blue-500 text-white'; // Light blue for In-progress
      case 'Rejected':
        return 'bg-yellow-400 text-white'; // Soft yellow for Rejected
      default:
        return 'bg-gray-100 text-gray-800'; // Lighter gray for neutral state
    }
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
                            <Dropdown
                              label={selectedResult ? selectedResult : "Select Result"}
                              className="w-full text-left dark:bg-gray-800 dark:text-gray-200 relative z-20"
                              inline
                            >
                              <Dropdown.Item onClick={() => handleResultSelection(null)}>
                                Clear Selection
                              </Dropdown.Item>
                              {resultsDropDown.map((result) => (
                                <Dropdown.Item
                                  key={result}
                                  onClick={() => handleResultSelection(result)}
                                >
                                  {selectedResult === result ? "✓ " : ""} {result}
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
                            {/* <Datepicker onChange={handleDateChange} /> */}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-center mb-3 mt-5">
                      <p className="text-left text-sm md:text-base text-gray-700 dark:text-white">
                        Last Updated: 
                        <span className="font-medium text-gray-600 dark:text-white">
                          {formattedDateTime ? `(${formattedDateTime})` : 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
                      <div className="table-wrapper overflow-x-auto max-h-[590px]">
                        <Table hoverable className="shadow-md w-full mt-5">
                          <TableHead hoverable className="shadow-md w-full">
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">#</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Account</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Instrument</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Quantity</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Profit</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Stop Loss</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Trade Time</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Direction</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Entry Time</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Entry Price</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Exit Time</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Exit Price</TableHeadCell>                                                      
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Status</TableHeadCell>
                            <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Duration</TableHeadCell>
                          </TableHead>
                          {loading ? (
                              <div className="flex justify-center items-center h-96">
                                <Spinner size="xl" />
                              </div>
                            ) : error ? (
                              <div className="text-red-600">{error}</div>
                            ) : filtered.length === 0 ? (
                              <div>No results found.</div>
                            ) : (
                              <TableBody>
                                {filtered.map((result, index) => (
                                  <TableRow key={result.id}>
                                    <TableCell >{index + 1}</TableCell>
                                    <TableCell >{result.Account}</TableCell>
                                    <TableCell  >{result.Instrument}</TableCell>
                                    <TableCell >{result.Quantity}</TableCell>
                                    <TableCell >{result.Profit ?? 'N/A'}</TableCell>
                                    <TableCell  >{result.StopLoss ?? 'N/A'}</TableCell>
                                    <TableCell  >{result.TradeTime ? convertTo12HourFormat(result.TradeTime) : 'N/A'}</TableCell>
                                    <TableCell  >{result.Direction}</TableCell>
                                    <TableCell  >
                                      {new Date(result.EntryTime).toLocaleString('en-US', {
                                        // timeZone: 'America/Los_Angeles',
                                        // weekday: 'short', // 'Mon'
                                        // year: 'numeric', // '2024'
                                        // month: 'short', // 'Nov'
                                        // day: 'numeric', // '29'
                                        hour: 'numeric', // '1'
                                        minute: 'numeric', // '00'
                                        second: 'numeric', // '00'
                                      })}
                                    </TableCell>

                                    <TableCell >
                                      ${result.EntryPrice}
                                    </TableCell>

                                    <TableCell >
                                      {
                                        result.Result === 'Rejected'
                                        ? new Date(result.EntryTime).toLocaleString('en-US', {
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                          })
                                        : (new Date(result.ExitTime).toLocaleString('en-US', {
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric',
                                          }) ?? 'In-progress')
                                      }
                                    </TableCell>

                                    <TableCell >${result.ExitPrice ?? 'In-progress'}</TableCell>          
                                    <TableCell className={` ${getColorClass(result.Result ?? 'In-progress')}`} title={result.Comment}>
                                      {result.Result ?? 'In-progress'}
                                    </TableCell>
                                    <TableCell>
                                      {
                                        (() => {
                                          const entryTime = new Date(result.EntryTime);
                                          
                                          let exitTime = new Date(result.ExitTime);
                                          if (!result.ExitTime) {
                                            exitTime = new Date();
                                          }
                                          // console.log('entryTime', entryTime);
                                          // console.log('exitTime', exitTime);
                                          const diffInSeconds = (exitTime - entryTime) / 1000;

                                          if (isNaN(diffInSeconds)) {
                                            return 'N/A';
                                          }

                                          const minutes = Math.floor(diffInSeconds / 60);
                                          const seconds = Math.floor(diffInSeconds % 60);

                                          if(result.Result === 'Rejected'){
                                            return '-'
                                          }else{
                                            return `${minutes} min`;
                                          }
                                          
                                        })()
                                      }
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            )}
                        </Table>
                      </div>
                    </div>
                </>
              )}
          </>
        )}
    </div>
  );
}
