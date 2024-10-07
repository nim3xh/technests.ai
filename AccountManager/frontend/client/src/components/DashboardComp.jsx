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
import { HiHome } from "react-icons/hi";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardComp() {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [paAccountsCount, setPaAccountsCount] = useState(0);
  const [nonPaAccountsCount, setNonPaAccountsCount] = useState(0);

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

        // Count PA and non-PA accounts
        const paCount = mergedData.filter((item) =>
          item.account.startsWith("PA")
        ).length;
        const nonPaCount = mergedData.length - paCount;

        setCombinedData(mergedData);
        setLoading(false);

        setPaAccountsCount(paCount);
        setNonPaAccountsCount(nonPaCount);
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

  // Calculate total number of accounts and rows
  const totalAccounts = uniqueAccountNumbers.length;
  const totalRows = combinedData.length;

  // Calculate unique accounts from filteredData
  const uniqueAccountsInFilteredData = new Set(
    combinedData.map((item) => `${item.accountNumber} (${item.name})`)
  );
  const totalUniqueAccountsDisplayed = uniqueAccountsInFilteredData.size;

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="#" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item></Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex-wrap flex gap-4 justify-center">
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Rows Displayed:
              </h3>
              <p className="text-2xl">{totalRows}</p>
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
              <p className="text-2xl">{totalUniqueAccountsDisplayed}</p>
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
              <p className="text-2xl">{paAccountsCount}</p>
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
              <p className="text-2xl">{nonPaAccountsCount}</p>
            </div>
            <GiMedievalGate className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
        </div>
        <div className="flex flex-col p-3">
          <Link
            to="/dashboard?tab=accountDetails"
            className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
          >
            <Button gradientDuoTone="greenToBlue">
              Filter Account Details
            </Button>
          </Link>
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
