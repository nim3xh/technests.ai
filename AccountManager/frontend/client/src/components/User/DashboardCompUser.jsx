import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiHome } from "react-icons/hi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Button,
  Tooltip,
  Breadcrumb,
  Alert,
} from "flowbite-react";
import { MdAccountBalance, MdPerson, MdTableRows } from "react-icons/md";
import { CiMemoPad } from "react-icons/ci";
import axios from "axios";
import { Datepicker } from "flowbite-react";
import useRealTimeDate from '../../hooks/useRealTimeDate';
import { set } from "lodash";


const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardCompUser() {
  const { currentUser } = useSelector((state) => state.user);
  const [createLoding, setCreateLoding] = useState(false);
  const [combinedData, setCombinedData] = useState([]);
  const [combinedDeletedData, setCombinedDeletedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [todayDate, setTodayDate] = useState(new Date());
  const [IsDownButtonEnabled, setIsDownButtonEnabled] = useState(false);
  const [IsCounterEnabled, setIsCounterEnabled] = useState(false);
  const [isUpButtonEnabled, setIsUpButtonEnabled] = useState(false);
  const [alert , setAlert] = useState(false);
  const [errAlert,seterrAlert] =  useState(false);
  const [deletedpaStats, setDeletedpaStats] = useState({
    PA1: 0,
    PA2: 0,
    PA3: 0,
    PA4: 0,
    paCount: 0, // PA Count > 53,000
    poCount: 0, // PO Count > 53,000
    adminOnly: 0, // Admin Only
  });

  const [paStats, setPaStats] = useState({
    PA1: 0,
    PA2: 0,
    PA3: 0,
    PA4: 0,
    paCount: 0, // PA Count > 53,000
    poCount: 0, // PO Count > 53,000
    adminOnly: 0, // Admin Only
  });
  const [createdDateTime, setCreatedDateTime] = useState("");

  const formattedTodayDate = useRealTimeDate();

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

  const fetchData = async () => {
  try {
    const token = currentUser.token;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [usersResponse, accountDetailsResponse] = await Promise.all([
      axios.get(`${BaseURL}users`, { headers }),
      axios.get(`${BaseURL}accountDetails/account/APEX-${currentUser.user.ApexAccountNumber}`, { headers }),
    ]);

    const mergedData = mergeData(
      usersResponse.data,
      accountDetailsResponse.data
    );

    setCombinedData(mergedData);

    // Set createdDateTime for the first item if available
    if (mergedData.length > 0) {
      setCreatedDateTime(mergedData[0].createdAt);
    } else {
      setCreatedDateTime(null);
    }

    // Initialize statistics
    const paStats = {
      PA1: 0,
      PA2: 0,
      PA3: 0,
      PA4: 0,
      paCount: 0, // PA Count > 53,000
      poCount: 0, // PO Count > 53,000
      adminOnly: 0, // Admin Only
    };

    // Categorize and count accounts
    mergedData.forEach((account) => {
      const balance = parseFloat(account.accountBalance);
      const isPA = account.account.startsWith("PA");
      const isEval = account.account.startsWith("APEX");
      const isAdmin = account.status === "admin only";
      const isActive = account.status === "active";

      // PA Account count > 53,000
      if (isEval && balance > 53000) {
        paStats.paCount++;
      }

      // PO Account count > 53,000
      if (isPA && balance > 53000) {
        paStats.poCount++;
      }

      // Admin Only Count
      if (isAdmin) {
        paStats.adminOnly++;
      }

      // Categorize PA account balance ranges
      if (isPA && isActive) {
        if ( balance > 53000 ) paStats.PA1++;
        else if ( balance > 56000) paStats.PA2++;
        else if ( balance > 59000) paStats.PA3++;
        else if ( balance > 62000) paStats.PA4++;
      }
    });

    setPaStats(paStats);
    setLoading(false);

    // Calculate statistics for each user
    const stats = {};
    let totalEvalActive = 0;
    let totalPAActive = 0;
    let totalEvalAdminOnly = 0;
    let totalPAAdminOnly = 0;

    mergedData.forEach((item) => {
      const userName = item.name + " (" + item.accountNumber.replace('APEX-', '') + ")";
      const isPA = item.account.startsWith("PA");
      const isActive = item.status === "active";
      const isEval = item.account.startsWith("APEX");
      const isAdmin = item.status === "admin only";

      // Initialize user stats if not already done
      if (!stats[userName]) {
        stats[userName] = {
          evalActive: 0,
          paActive: 0,
          evalAdminOnly: 0,
          paAdminOnly: 0,
        };
      }

      // Increment counts based on conditions
      if (isEval && isActive) {
        stats[userName].evalActive++;
        totalEvalActive++;
      }
      if (isPA && isActive) {
        stats[userName].paActive++;
        totalPAActive++;
      }
      if (isAdmin && isEval) {
        stats[userName].evalAdminOnly++;
        totalEvalAdminOnly++;
      }
      if (isAdmin && isPA) {
        stats[userName].paAdminOnly++;
        totalPAAdminOnly++;
      }
    });

    // Transform stats into an array for rendering
    const userStatsArray = Object.keys(stats).map((userName) => ({
      userName,
      ...stats[userName],
      totalAccounts: stats[userName].evalActive + stats[userName].paActive,
    }));

    setUserStats(userStatsArray);
  } catch (err) {
    console.error("Error fetching data:", err);
    setError("Something went wrong while fetching data.");
    setLoading(false);
  }
};

  const fetchDeletedData = async () => {
    setLoading(true);
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [usersResponse, accountDetailsResponse] = await Promise.all([
        axios.get(`${BaseURL}users`, { headers }),
        axios.get(`${BaseURL}accountDetails/viewDeleted/APEX-${currentUser.user.ApexAccountNumber}`, { headers }),
      ]);

      const mergedData = mergeData(
        usersResponse.data,
        accountDetailsResponse.data
      );
      
      setCombinedDeletedData(mergedData);

      // Initialize statistics
      const deletedpaStats = {
        PA1: 0,
        PA2: 0,
        PA3: 0,
        PA4: 0,
        paCount: 0, // PA Count > 53,000
        poCount: 0, // PO Count > 53,000
        adminOnly: 0, // Admin Only
      };

      // Categorize and count accounts
      mergedData.forEach((account) => {
        const balance = parseFloat(account.accountBalance);
        const isPA = account.account.startsWith("PA");
        const isEval = account.account.startsWith("APEX");
        const isAdmin = account.status === "admin only";
        const isActive = account.status === "active";

        // PA Account count > 53,000
        if (isEval && balance > 53000) {
          deletedpaStats.paCount++;
        }

        // PO Account count > 53,000
        if (isPA && balance > 53000) {
          deletedpaStats.poCount++;
        }

        // Admin Only Count
        if (isAdmin) {
          deletedpaStats.adminOnly++;
        }

        // Categorize PA account balance ranges
        if (isPA && isActive) {
          if (balance >= 47500 && balance <= 53200) deletedpaStats.PA1++;
          else if (balance >= 53201 && balance <= 55800) deletedpaStats.PA2++;
          else if (balance > 55800 && balance <= 58000) deletedpaStats.PA3++;
          else if (balance > 58000 && balance <= 60600) deletedpaStats.PA4++;
        }

      });

      setDeletedpaStats(deletedpaStats);
      setLoading(false);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Something went wrong while fetching data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDeletedData();
  }, [BaseURL, currentUser]);

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

  // Calculate unique accounts from filteredData
  const uniqueAccountsInFilteredData = new Set(
    combinedData.map((item) => `${item.accountNumber} (${item.name})`)
    
  );
  const totalUniqueAccountsDisplayed = uniqueAccountsInFilteredData.size;

  const downloadCsvs = async () => {
    try {
      const accountNumber = currentUser?.user?.ApexAccountNumber;
      // alert(accountNumber);
  
      if (!accountNumber) {
        seterrAlert("Please contact the admin to assign an account number to your account.");
        return;
      }

      const downloadUrl = `${BaseURL}download/${accountNumber}`;
      // console.log(`Downloading CSVs from: ${downloadUrl}`);
  
      // Trigger the file download
      const response = await fetch(downloadUrl, {
        method: 'GET',
      });
  
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
  
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `${accountNumber}_Trades.csv`;
        document.body.appendChild(a);
        a.click();
  
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        // console.log("CSV files downloaded successfully.");
      } else {
        // console.error(`Failed to download CSV files. Status: ${response.status}`);
      }
    } catch (error) {
      // console.error("An error occurred while downloading CSV files:", error);
    }
  };

  const uploadCsv = async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv"; 
      input.multiple = false; 

      const accountNumber = currentUser?.user?.ApexAccountNumber;
      if (!accountNumber) {
          seterrAlert("Please contact the admin to assign an account number to your account.");
          return;
      }

      input.onchange = async (event) => {
          const csvFile = event.target.files[0]; 
          if (!csvFile) return;

          const reader = new FileReader();
          reader.onload = async (e) => {
              const csvContent = e.target.result; 
              const rows = csvContent.split("\n").map((row) => row.split(","));
              const header = rows[0]; 
              const accountIndex = header.indexOf('"Account"'); 
              
              if (accountIndex === -1) {
                  console.error("No 'Account' column found in the CSV");
                  return;
              }

              const firstAccountValue = rows[1]?.[accountIndex]?.replace(/"/g, ""); 
              if (firstAccountValue) {
                  console.log("First Account Value:", firstAccountValue);

                  const extractAccountNumber = (account) => {
                      const matches = account.match(/(?:PA-)?APEX-(\d+)-\d+/);
                      return matches ? matches[1] : null;
                  };

                  const extractedAccountNumber = extractAccountNumber(firstAccountValue);
                  console.log("Extracted Account Number:", extractedAccountNumber);

                  if (extractedAccountNumber !== accountNumber) {
                      seterrAlert("The CSV account does not match the user account number.");
                      return;
                  }
              } else {
                  seterrAlert("No value found in the 'Account' column");
                  return;
              }

              // Proceed with file upload
              const formData = new FormData();
              formData.append("csvFile", csvFile);
              setCreateLoding(true);

              try {
                  const token = currentUser.token;

                  await axios.delete(`${BaseURL}accountDetails/account/APEX-${currentUser.user.ApexAccountNumber}`, {
                      headers: { Authorization: `Bearer ${token}` },
                  });

                  await axios.post(`${BaseURL}accountDetails/add-account`, formData, {
                      headers: {
                          "Content-Type": "multipart/form-data",
                          Authorization: `Bearer ${token}`,
                      },
                  });

                  setIsDownButtonEnabled(false);
                  setIsUpButtonEnabled(false);

                  try{
                        const token = currentUser.token;
                        await axios.post(`${BaseURL}trigger-trade-crate/${currentUser.user.ApexAccountNumber}`, null, {
                          headers: {
                              Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
                          },
                      });
                    } catch (error) {
                        console.error("Error triggering trade data:", error);
                        seterrAlert("Failed to trigger trade data.");
                        // setCreateLoding(false);
                    }
                  startReverseTimer(); // Start the countdown timer
                  
              } catch (error) {
                  console.error("Error uploading CSV:", error);
                  seterrAlert("Failed to upload the CSV file.");
                  setCreateLoding(false);
              }
          };

          reader.onerror = (e) => {
              console.error("Error reading the file:", e.target.error);
          };

          reader.readAsText(csvFile);
      };

      input.click();
  };

  // Function to start the 5-minute reverse countdown
  const startReverseTimer = async () => {
      setIsCounterEnabled(true);
      let timeLeft = 300; // 5 minutes in seconds
      setAlert("Finding signals … please wait ⏳");
      const timerInterval = setInterval(() => {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          setAlert(`Finding signals … please wait ⏳ ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

          if (timeLeft <= 0) {
              clearInterval(timerInterval);
              setAlert("✅ Success! You can now download the CSV.");
              setIsDownButtonEnabled(true); // Enable the download button
              setIsUpButtonEnabled(true); // Enable the upload button
              setIsCounterEnabled(false); // Disable the counter
              setCreateLoding(false); // Stop the loading spinner
          } else {
            setIsDownButtonEnabled(false);
            setIsUpButtonEnabled(false);
            setIsCounterEnabled(true);
            setCreateLoding(true);
          }

          timeLeft--;
      }, 1000); // Update every second
  };

  const now = new Date();

  useEffect(() => {
      const checkTime = () => {
        // Get the current time in PST
        const nowPST = new Date().toLocaleString('en-US', { 
          timeZone: 'America/Los_Angeles', 
          hour12: false 
        });      
        const hours = new Date(nowPST).getHours();
        const minutes = new Date(nowPST).getMinutes();

        // Enable the button between 10 PM and 6 AM PST
        if (hours >= 22 || hours < 6 || (hours === 6 && minutes === 0)) {
          setIsDownButtonEnabled(true);
        } else {
          setIsDownButtonEnabled(true);
        }
      };

      // Check time every minute
      const intervalId = setInterval(checkTime, 60000);

      // Run the check on initial load
      checkTime();

      return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
      const checkTime = () => {
         // Get the current time in PST
         const nowPST = new Date().toLocaleString('en-US', { 
          timeZone: 'America/Los_Angeles', 
          hour12: false 
        });  
        const hours = new Date(nowPST).getHours();
        const minutes = new Date(nowPST).getMinutes();

        // Enable the button between 7 PM and 1:00 AM PST
        if ((hours >= 19 && hours < 24) || (hours >= 0 && hours < 1)) {
          setIsUpButtonEnabled(true);
        } else {
          setIsUpButtonEnabled(true);
        }
      };

      // Check time every minute
      const intervalId = setInterval(checkTime, 60000);

      // Run the check on initial load
      checkTime();

      return () => clearInterval(intervalId);
    }, []);

  
  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="#" icon={HiHome}>
          Home
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="text-2xl text-center mt-4">
        Welcome, {currentUser.user.FirstName} {currentUser.user.LastName}!
      </div>
      <p className="text-lg font-semibold text-gray-600 dark:text-white">{formattedTodayDate}</p> 
      {currentUser.user.role === "user" && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div className="flex-wrap flex gap-4 justify-center mt-4">
                  {!isUpButtonEnabled ? (
                    !IsCounterEnabled ? (
                      <Tooltip content="Upload is only allowed between 7 PM and 1 AM PST">
                        <Button gradientDuoTone="greenToBlue" onClick={uploadCsv} disabled>
                          <>Upload CSV</>
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button gradientDuoTone="greenToBlue" onClick={uploadCsv} disabled>
                        <>Upload CSV</>
                      </Button>
                    )
                  ) : (
                    <Button gradientDuoTone="greenToBlue" onClick={uploadCsv}>
                      {createLoding ? (
                        <>
                          <Spinner size="sm" />
                          <span className="pl-3">Loading...</span>
                        </>
                      ) : (
                        <>Upload CSV</>
                      )}
                    </Button>
                  )}
                  <br />
                  {!IsDownButtonEnabled ? (
                    !IsCounterEnabled ? (
                      <Tooltip content="Available after 10:00 PM PST">
                        <Button gradientDuoTone="purpleToBlue" onClick={downloadCsvs} disabled>
                          <>Download CSV</>
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button gradientDuoTone="purpleToBlue" onClick={downloadCsvs} disabled>
                        <>Download CSV</>
                      </Button>
                    )
                  ) : (
                    <Button gradientDuoTone="purpleToBlue" onClick={downloadCsvs}>
                      {createLoding ? (
                        <>
                          <Spinner size="sm" />
                          <span className="pl-3">Loading...</span>
                        </>
                      ) : (
                        <>Download CSV</>
                      )}
                    </Button>
                  )}
                </div>
                {/* Link for downloading default file */}
                {/* <div className="text-center mb-4 mt-4">
                  <a
                    href={`${BaseURL}download/demo`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-700"
                  >
                    Click here to download the default dashboard file template
                  </a>
                  <p className="text-sm text-gray-600">
                    Use this template for best results when uploading your dashboard file.
                  </p>
                </div> */}

                {alert && (
                  <Alert color="success" onDismiss={() => setAlert(false)}>
                    <span className="font-medium"></span> {alert}
                   </Alert>
                  )}
                {errAlert && (
                  <Alert color='red' onDismiss={() => seterrAlert(false)}>
                    <span className="font-medium"></span> {errAlert}
                  </Alert>
                )}
            </>
          )}
        </>
      )}
    </div>
  );
}