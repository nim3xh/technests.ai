export const formatBalance = (balance) => {
    if (isNaN(balance)) return "$0"; // Handle invalid numbers
    return `$${Number(balance).toLocaleString('en-US')}`;
  };
  