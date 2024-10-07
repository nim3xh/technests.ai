import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { MdTableRows } from "react-icons/md";
import { MdAccountBalance } from "react-icons/md";
import { GiMedievalGate } from "react-icons/gi";
import { CiMemoPad } from "react-icons/ci";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Breadcrumb,
  Button,
  Modal,
  Label,
  TextInput,
  Select,
} from "flowbite-react";
import { Link } from "react-router-dom";
import axios from "axios";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  // Function to merge users and account details data
  const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown",
      };
    });
  };

  useEffect(() => {
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
        console.error("Error fetching data:", err);
        setError("Something went wrong while fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [BaseURL, currentUser]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Total Users</h3>
              <p className="text-2xl">15</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Rows Displayed:
              </h3>
              <p className="text-2xl">15</p>
            </div>
            <MdTableRows className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Unique Accounts{" "}
              </h3>
              <p className="text-2xl">15</p>
            </div>
            <MdAccountBalance className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total PA Account Rows:
              </h3>
              <p className="text-2xl">15</p>
            </div>
            <CiMemoPad className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Eval Account Rows:
              </h3>
              <p className="text-2xl">15</p>
            </div>
            <GiMedievalGate className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
      </div>
      <Table hoverable className="shadow-md w-full mt-6">
        <TableHead>
          <TableHeadCell>Account</TableHeadCell>
          <TableHeadCell>Account Balance</TableHeadCell>
          <TableHeadCell>Account Name</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Trailing Threshold</TableHeadCell>
          <TableHeadCell>PnL</TableHeadCell>
        </TableHead>
        <TableBody>
          {combinedData.map((data, index) => (
            <TableRow key={index}>
              <TableCell>{data.accountNumber}</TableCell>
              <TableCell>{data.accountBalance}</TableCell>
              <TableCell>{data.name}</TableCell>
              <TableCell>{data.status}</TableCell>
              <TableCell>{data.trailingThreshold}</TableCell>
              <TableCell>{data.PnL}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
