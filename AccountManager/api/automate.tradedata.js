const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs');

const accountDetails = [
    { accountNumber: "APEX-62849", name: "Sachin Suyamindra" },
    { accountNumber: "APEX-245360", name: "Reuven Benjamin Goodwin" },
    { accountNumber: "APEX-194858", name: "Sindhu Mukunda" },
    { accountNumber: "APEX-194320", name: "Lourdhu Manohar Reddy Yennam" },
    { accountNumber: "APEX-246808", name: "Yennam Joseph Inna Reddy" },
    { accountNumber: "APEX-248714", name: "Kiran Gururaj" },
    { accountNumber: "APEX-248560", name: "Rajit Subramanya" },
    { accountNumber: "APEX-244324", name: "Avanya Innovations Llc Anant Kulkarni" },
    { accountNumber: "APEX-182660", name: "Venkatesha Belavadi" },
    { accountNumber: "APEX-266734", name: "Umesh Paduvagere Chikkkehucha" },
    { accountNumber: "APEX-266645", name: "Nischay Gowda" },
    { accountNumber: "APEX-266751", name: "Bobby Karami" },
];
let combinedData = [];
let tradesData = [];
const BaseURL = "http://localhost:3000/";

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
      const [usersResponse, accountDetailsResponse] = await Promise.all([
        axios.get(`${BaseURL}users/index`, {  }),
        axios.get(`${BaseURL}accountDetails/index`, {  }),
      ]);

      const mergedData = mergeData(
        usersResponse.data,
        accountDetailsResponse.data
      );
      
      combinedData = mergedData;

    } catch (err) {
      console.error("Error fetching data:", err);
      console.error("Something went wrong while fetching data.");
    }
};

const fetchTrades = async () => {
    try {
      const tradesResponse = await axios.get(`${BaseURL}trades/index`, {
      });
      tradesData=tradesResponse.data;
      
    } catch (err) {
        console.error("Something went wrong while fetching data.");
      
    }
};

// Function to generate the formatted account string: "Company-ID (Name)"
const formatAccountString = (account) => {
    return `${account.accountNumber} (${account.name})`;
};

// Function to split the accountDetails into groups of 3 accounts
const groupAccountsInSets = (accounts, size) => {
    const result = [];
    for (let i = 0; i < accounts.length; i += size) {
      result.push(accounts.slice(i, i + size));
    }
    return result;
};

function automateTradeData() {
    // Define the helper function first
    const selectSetsOfThreeAcc = () => {
        // Assume fetchData and fetchTrades are defined elsewhere and populate accountDetails
        fetchData();
        fetchTrades();

        // Check if accountDetails exists and contains data
        if (!accountDetails || accountDetails.length === 0) {
            console.error("No account details available.");
            return;
        }

        const formattedAccounts = accountDetails.map(formatAccountString);
        const groupedSets = groupAccountsInSets(formattedAccounts, 3); // Group accounts in sets of 3
        // console.log(groupedSets);

        // Export CSV after updating selected accounts for each set
        exportCSVForEachAccount(groupedSets);
    };

    // Call the function
    selectSetsOfThreeAcc();
}

    // Function to get a random time within a specified range
    const getRandomTime = (startHour, startMinute, endHour, endMinute) => {
        let start = new Date();
        start.setHours(startHour, startMinute, 0, 0);
        
        let end = new Date();
        end.setHours(endHour, endMinute, 0, 0);
        
        let randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        
        return randomTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Function to get trade time based on account balance and type
    const getTradeTime = (accountType, accountBalance) => {
        if (accountType.startsWith("APEX")) {
            if (accountBalance < 53000) {
                return getRandomTime(7, 30, 8, 30); // EVAL Standard trades
            } else {
                return "No Trade"; // No trade for EVAL if balance >= 53000
            }
        } else if (accountType.startsWith("PA")) {
            return getRandomTime(5, 0, 12, 45); // PA trading time
        }
        return "-"; // Default fallback
    };

  // Function to determine the trade name based on account balance and account type (PA or EVAL)
  const getTradeNameBasedOnBalance = (accountType, balance) => {
    if (accountType.startsWith("APEX")) {
        return "EVAL STD"; // for all EVAL accounts
    }

    // Check if the account type is "PA"
    if (accountType.startsWith("PA")) { 
      if (balance >= 49000 && balance <= 52599) {
        return "PA STD"; // For PA accounts with balance between 49000 and 52600
      } else if(balance >= 52400 && balance < 53000) {
        return "PA Mini"; // For PA accounts with balance between 52800 and 53000
      } else if (balance < 49000) {
        return "PA Max"; // For PA accounts with balance below 49000
      } else if (balance >= 52600) {
        return "PA micro"; // For PA accounts with balance 53k or more
      } else {
        return "PA micro"; // For PA accounts with balance above 53000
      }
    }
    return "-"; // Default fallback if no condition matches
};


const exportCSVForEachAccount = async (groupedSets) => {
    const createTableDataForAllAccounts = (accounts) => {
        // Filter accounts based on conditions
        let filteredAccounts = combinedData.filter(
        (account) =>
            account.status !== "admin only" &&
            accounts.includes(`${account.accountNumber} (${account.name})`)
        );
    
        const paAccounts = filteredAccounts.filter((item) => item.account.startsWith("PA"));
        let evalAccounts = filteredAccounts.filter((item) => item.account.startsWith("APEX"));
        evalAccounts = evalAccounts.filter((item) => item.accountBalance < 53000);

        // Group accounts by user
        const userAccountsPA = accounts.map((user) =>
            paAccounts.filter((account) => `${account.accountNumber} (${account.name})` === user)
        );

        const userAccountsEVAL = accounts.map((user) =>
            evalAccounts.filter((account) => `${account.accountNumber} (${account.name})` === user)
        );

        // Flatten grouped accounts for easier processing
        const unmatchedAccountsPA = userAccountsPA.flat();
        const unmatchedAccountsEVAL = userAccountsEVAL.flat();

        const matchesPA = [];
        const matchesEVAL = [];
  
        // Matching function for accounts
        const matchAccounts = (accounts, matches) => {
            let matchedThisRound;
            do {
                matchedThisRound = false;
                for (let i = 0; i < accounts.length; i++) {
                    for (let j = i + 1; j < accounts.length; j++) {
                        const account1 = accounts[i];
                        const account2 = accounts[j];

                        if (
                            account1 &&
                            account2 &&
                            account1.accountNumber !== account2.accountNumber &&
                            Math.abs(account1.accountBalance - account2.accountBalance) <= 125 &&
                            !matches.some((match) => match.includes(account1) || match.includes(account2))
                        ) {
                            matches.push([account1, account2]);
                            accounts.splice(j, 1); // Remove matched accounts
                            accounts.splice(i, 1);
                            matchedThisRound = true;
                            break;
                        }
                    }
                    if (matchedThisRound) break;
                }
            } while (matchedThisRound);
        };

        // Match PA and EVAL accounts to maximize matches
        matchAccounts(unmatchedAccountsPA, matchesPA);
        matchAccounts(unmatchedAccountsEVAL, matchesEVAL);

        // Generate rows for matched accounts
        const rows = [...matchesPA, ...matchesEVAL].map(([account1, account2], i) => {
            const tradeTime = getTradeTime(account1.account,account1.accountBalance);
            const direction1 = account1.accountBalance >= 53000 ? "Long" : i % 2 === 0 ? "Long" : "Short";
            const direction2 = account2.accountBalance >= 53000 ? "Long" : direction1 === "Long" ? "Short" : "Long";

            return [
                {
                    direction: direction1,
                    account: account1.account,
                    balance: account1.accountBalance,
                    time: tradeTime,
                    trade: getTradeNameBasedOnBalance(account1.account, account1.accountBalance),
                    accountNumber: account1.accountNumber,
                },
                {
                    direction: direction2,
                    account: account2.account,
                    balance: account2.accountBalance,
                    time: tradeTime,
                    trade: getTradeNameBasedOnBalance(account2.account, account2.accountBalance),
                    accountNumber: account2.accountNumber,
                },
            ];
        });

        // Add unmatched accounts
        unmatchedAccountsPA.concat(unmatchedAccountsEVAL).forEach((account, i) => {
            const direction = i % 2 === 0 ? "Long" : "Short";
            const time = getTradeTime(account.account,account.accountBalance);
            rows.push([
                {
                    direction: direction,
                    account: account.account,
                    balance: account.accountBalance,
                    time: time,
                    trade: "PA micro",
                    accountNumber: account.accountNumber,
                },
            ]);
        });

        // Ensure unique times for accounts with the same time
        const flattenedRows = rows.flat();
    
        for (let i = 0; i < flattenedRows.length; i++) {
            for (let j = i + 1; j < flattenedRows.length; j++) {
                if (
                    flattenedRows[i].time === flattenedRows[j].time &&
                    flattenedRows[i].accountNumber === flattenedRows[j].accountNumber
                ) {
                    flattenedRows[j].time = getTradeTime(flattenedRows[j].account,flattenedRows[j].balance);
                }
            }
        }

        // Synchronize the changes back to the original rows
        let index = 0;
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < rows[i].length; j++) {
                rows[i][j] = flattenedRows[index];
                index++;
            }
        }

        // Return flattened rows and stats
        return rows.flat();
    };

    const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(":");
        let hour = parseInt(hours, 10);
        const modifier = hour >= 12 ? "PM" : "AM";
        if (hour === 0) hour = 12; 
        else if (hour > 12) hour -= 12;
        return `${hour.toString().padStart(2, "0")}:${minutes} ${modifier}`;
    };

    const createTradeCSV = (tradeData, accountLabel, accountNumbers, accountDirection,time) => {
        const tradeHeaders = [
            `Direction (${accountLabel})`,
            "Quantity", "Time", "Stop Loss", "Profit", "Use Breakeven", "Breakeven Trigger", "Breakeven Offset", "Use Trail", "Trail Trigger", "Trail", "Instrument", "Account Number",
        ];

        const tradeCSV = [tradeHeaders.join(",")];
        tradeData.forEach((trade, index) => {
            tradeCSV.push(
                [
                    accountDirection[index],
                    trade.Quantity,
                    convertTo12HourFormat(time[index]),
                    trade.StopLoss,
                    trade.Profit,
                    trade.UseBreakeven,
                    trade.BreakevenTrigger,
                    trade.BreakevenOffset,
                    trade.UseTrail,
                    trade.TrailTrigger,
                    trade.Trail,
                    trade.Instrument,
                    // trade.Repeat,
                    // trade.RepeatTimes,
                    // trade.RepeatEvery,
                    accountNumbers[index] || "-",
                ].join(",")
            );
        });

        return tradeCSV.join("\n");
    };

    if(groupedSets !== null){
        //destroy all before adding new data
        try {
            const response = await axios.delete(`${BaseURL}tradedata/deleteAll`, {
            });
            console.log('successfully deleted trade data');
          } catch (error) {
            console.error("Error deleting trade data:", error);
            console.error("Something went wrong while deleting trade data.");
        }

        // Loop through each set of accounts
        for (const accounts of groupedSets) {
            const tableData = createTableDataForAllAccounts(accounts);
            for (let i = 0; i < accounts.length; i++) {
                const tableHeaders = [
                    `Trade (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`,
                    `Direction (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`,
                    `Account (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`,
                    `Account Balance (${accounts[i].replace(/APEX-/, "").split(" ")[0]})`
                ];

                const tableCSV = [tableHeaders.join(",")];
                  tableData.forEach((row) => {
                      tableCSV.push(
                          [
                              row.trade,
                              row.direction,
                              row.account,
                              row.balance,
                              row.time,
                          ].join(",")
                      );
                });

                let filteredAccountData = tableData.filter((account) => {
                    // Extract the account number after "APEX-" and before any non-digit characters
                    const accountNumber = account.account.replace(/.*APEX-(\d+)-.*/, "$1");
                    
                    // Extract the numeric part from the input string in a similar manner
                    const filteredAccountStringFromInput = accounts[i].replace(/APEX-/, "").split(" ")[0];
                
                    // Time validation: Check if the time is in valid format (HH:mm)
                    const timeValid = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/.test(account.time);
                
                    // Check if the trade name is valid
                    const tradeValid = tradesData.find((trade) => trade.TradeName === account.trade);
                
                    // Return true if the account matches the input string, time is valid, and trade name is valid
                    return  tradeValid && accountNumber === filteredAccountStringFromInput;
                });
                
                const accountTrades = filteredAccountData.map((row) => ({
                    trade: tradesData.find((trade) => trade.TradeName === row.trade),
                    accountNumber: row.account,
                    direction: row.direction,
                    time: row.time,
                })).filter((item) => item.trade);

                console.log(accountTrades);

                const tradeCSV = createTradeCSV(
                    accountTrades.map((item) => item.trade),
                    accounts[i].replace(/APEX-/, "").split(" ")[0],
                    accountTrades.map((item) => item.accountNumber),
                    accountTrades.map((item) => item.direction),
                    accountTrades.map((item) => item.time)
                );

                //handle add trade data to db
                for(let i = 0; i < accountTrades.length; i++){
                    const tradeData = {
                      Direction: accountTrades[i].direction,
                      Quantity: accountTrades[i].trade.Quantity,
                      Time: accountTrades[i].time,
                      Stop_Loss: accountTrades[i].trade.StopLoss,
                      Profit: accountTrades[i].trade.Profit,
                      Use_Breakeven: accountTrades[i].trade.UseBreakeven,
                      Breakeven_Trigger: accountTrades[i].trade.BreakevenTrigger,
                      Breakeven_Offset: accountTrades[i].trade.BreakevenOffset,
                      Use_Trail: accountTrades[i].trade.UseTrail,
                      Trail_Trigger: accountTrades[i].trade.TrailTrigger,
                      Trail: accountTrades[i].trade.Trail,
                      Instrument: accountTrades[i].trade.Instrument,
                      Repeat: accountTrades[i].trade.Repeat,
                      Repeat_Times: accountTrades[i].trade.RepeatTimes,
                      Repeat_Every: accountTrades[i].trade.RepeatEvery,
                      Account_Number: accountTrades[i].accountNumber
                    };
                     try {
                      
                      const response = await axios.post(`${BaseURL}tradedata`, tradeData, {
                       
                      });
                    }catch (err) {
                      alert("Error adding trade data:", err);
                    }
                  }

                  let accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_Trades.csv`;

                  accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_Trades.csv`;

                await saveCSVToBackend(tradeCSV, `${accountFileName}`, accounts[i].replace(/APEX-/, "").split(" ")[0]);

                accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_PA.csv`;

                const filterPATradeCSV = tradeCSV.split("\n").filter((line, index) => {
                    if (index === 0) return true; // Keep the header row
                    const accountNumber = line.split(",")[12];
                    return accountNumber.startsWith("PA");
                }).join("\n");
                    
                await saveCSVToBackend(filterPATradeCSV, `${accountFileName}`, accounts[i].replace(/APEX-/, "").split(" ")[0]);

                accountFileName = `${accounts[i].replace(/APEX-/, "").split(" ")[0]}_EVAL.csv`;

                const filterEVALTradeCSV = tradeCSV.split("\n").filter((line, index) => {
                    if (index === 0) return true; // Keep the header row
                    const accountNumber = line.split(",")[12];
                    return accountNumber.startsWith("APEX");
                }).join("\n");
                    
                await saveCSVToBackend(filterEVALTradeCSV, `${accountFileName}`, accounts[i].replace(/APEX-/, "").split(" ")[0]);

            }
        }
    };
    return;
};

// Function to save CSV to backend
const saveCSVToBackend = async (csvData, filename, apexid) => {
    const formData = new FormData();

    try {
        // Append the CSV data as a buffer (for Node.js compatibility)
        formData.append("csvFile", Buffer.from(csvData), filename);
        formData.append("apexid", apexid);  // Append apexid to the form data

        // Post the form data to the server
        const response = await axios.post(`${BaseURL}upload-trade`, formData, {
            headers: formData.getHeaders(), // Automatically adds correct multipart headers
        });

        // console.log("File uploaded successfully:", response.data);
    } catch (error) {
        console.error("Error uploading file:", error.message);
    }
};

module.exports = automateTradeData;