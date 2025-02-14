const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require("axios");

const BaseURL = "http://localhost:3000/";

const tradesFolder = path.join(__dirname, 'dashboards', 'trades');
let combinedData = [];

const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
        const user = users.find((u) => u.accountNumber === account.accountNumber);
        return {
            ...account,
            name: user ? user.name : "Unknown",
        };
    });
};

const fetchData = async (apexID) => {
    try {
        const [usersResponse, accountDetailsResponse] = await Promise.all([
            axios.get(`${BaseURL}users/index`),
            axios.get(`${BaseURL}accountDetails/accCrate/APEX-${apexID}`)
        ]);

        combinedData = mergeData(usersResponse.data, accountDetailsResponse.data);
    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

const processTrades = async (apexID) => {
    try {
        const files = fs.readdirSync(tradesFolder).filter(file => file.endsWith('.csv'));
        if (files.length === 0) {
            console.log("No CSV files found in the trades folder.");
            return;
        }

        const randomFile = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(tradesFolder, randomFile);

        console.log("Reading file:", randomFile);

        const trades = [];
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Pick a random account from merged data
                const randomAccount = combinedData[Math.floor(Math.random() * combinedData.length)];
                
                // Add account number to the trade row
                if (randomAccount) {
                    row.Account = randomAccount.account;
                    trades.push(row);
                }
            })
            .on('end', () => {
                console.log("Merged data:", JSON.stringify(trades, null, 2));
                
                // Save cleaned trade data
                const outputPath = path.join(__dirname, 'dashboards', apexID, `${apexID}_Trades.json`);
                fs.writeFileSync(outputPath, JSON.stringify(trades, null, 2));
                
                console.log(`Processed trades saved to: ${outputPath}`);
            });

    } catch (error) {
        console.error("Error processing trade files:", error);
    }
};

const test = async (apexID) => {
    console.log("Starting test", apexID);
    await fetchData(apexID);
    await processTrades(apexID);
};

module.exports = test;