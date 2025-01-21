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

  const fetchTrades = async () => {
    try{
      const token = currentUser.token;

      const headers ={
        Authorization: `Bearer ${token}`
      };

      const response = await axios.get(`${BaseURL}tradeData`, { headers });
      setTrades(response.data);

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

  useEffect(() => {
    fetchTrades();
  }, []);
  
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
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center md:space-x-4">
              <div className="table-wrapper overflow-x-auto max-h-[690px]">
               <Table hoverable className="shadow-md w-full mt-4">
               <TableHead>
                  <TableRow>
                    {/* <TableHeadCell>#</TableHeadCell> */}
                    <TableHeadCell className="sticky top-0 bg-white z-10 hidden sm:table-cell">Account Number</TableHeadCell>
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
                    {trades.map((trade, index) => (
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
