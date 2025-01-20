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

export default function DashCreatedTradeView() {
  const formattedTodayDate = useRealTimeDate();
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
    </div>
  )
}
