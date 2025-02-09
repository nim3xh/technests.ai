const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs');

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