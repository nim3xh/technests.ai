export const formatBalance = (balance) => {
    if (isNaN(balance)) return "$0"; // Handle invalid numbers
    // Convert to a number, remove decimals, and format with commas
    return `$${Math.trunc(Number(balance)).toLocaleString('en-US')}`;
  };
  