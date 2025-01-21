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
            
            </>
          )} {/* Display the spinner only if the loading is true */}
        </>
      )} {/* Display the table only if the user is not a user */}
    </div>
  )
}
