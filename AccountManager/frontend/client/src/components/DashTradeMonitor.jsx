import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Spinner,
  Dropdown,
} from "flowbite-react";
import useRealTimeDate from '../hooks/useRealTimeDate';


export default function DashTradeMonitor() {
  const formattedTodayDate = useRealTimeDate();

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
      {/* Under Development Section */}
      <div className="text-center my-8">
        <div className="bg-yellow-100 p-8 rounded-lg">
          <h1 className="text-2xl font-semibold text-yellow-600">
            🚧 This page is under development 🚧
          </h1>
        </div>
      </div>
    </div>
  );
}
