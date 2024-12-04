import { Breadcrumb, Dropdown } from 'flowbite-react';
import React from 'react';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { HiHome } from "react-icons/hi";
import useRealTimeDate from '../hooks/useRealTimeDate';
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function TradeMatchingCom() {
    const [loading, setLoading] = useState(true);
    const { currentUser } = useSelector((state) => state.user);
    const [combinedData, setCombinedData] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);

    const formattedTodayDate = useRealTimeDate();

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
            const token = currentUser.token;
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [usersResponse, accountDetailsResponse] = await Promise.all([
                axios.get(`${BaseURL}users`, { headers }),
                axios.get(`${BaseURL}accountDetails`, { headers }),
            ]);

            const mergedData = mergeData(
                usersResponse.data,
                accountDetailsResponse.data
            );

            setCombinedData(mergedData);
            setLoading(false);
        } catch (err) {
            alert("Error fetching data:", err);
            setLoading(false);
        }
    };

    const encounteredAccounts = new Set();

    const uniqueAccountNumbers = combinedData
        .map((item) => {
            const match = item.accountNumber.match(/^(APEX-\d+)/);
            if (match) {
                const accountNumber = match[1];
                if (!encounteredAccounts.has(accountNumber)) {
                    encounteredAccounts.add(accountNumber);
                    return `${accountNumber} (${item.name})`;
                }
            }
            return null;
        })
        .filter(Boolean);

    const handleAccountSelection = (account) => {
        setSelectedAccounts((prevSelected) => {
            if (prevSelected.includes(account)) {
                return prevSelected.filter((acc) => acc !== account);
            } else if (prevSelected.length < 3) {
                return [...prevSelected, account];
            } else {
                alert("You can only select up to three accounts.");
                return prevSelected;
            }
        });
    };

    const clearSelection = () => {
        setSelectedAccounts([]);
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
                <Breadcrumb.Item>Trade Matching</Breadcrumb.Item>
            </Breadcrumb>
            <p className="text-lg font-semibold text-gray-600 dark:text-white">
                {formattedTodayDate}
            </p>
            <h1 className="mt-3 mb-3 text-left font-semibold text-xl flex justify-between items-center">
                <span>
                Trade Matching
                </span>
            
            </h1>
            <Dropdown
                label={
                    selectedAccounts.length > 0
                        ? selectedAccounts.map((acc) => acc.replace(/APEX-/, "")).join(", ")
                        : "Select Three Users"
                }
                className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
                inline
            >
                <Dropdown.Item onClick={clearSelection}>
                    Clear Selection
                </Dropdown.Item>
                {uniqueAccountNumbers.map((account) => (
                    <Dropdown.Item
                        key={account}
                        onClick={() => handleAccountSelection(account)}
                    >
                        {selectedAccounts.includes(account) ? "✓ " : ""}{" "}
                        {account.replace(/APEX-/, "")}
                    </Dropdown.Item>
                ))}
            </Dropdown>
        </div>
    );
}