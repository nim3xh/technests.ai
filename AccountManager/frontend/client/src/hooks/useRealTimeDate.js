import { useState, useEffect } from 'react';
import axios from 'axios';

const useRealTimeDate = () => {
  const [formattedTodayDate, setFormattedTodayDate] = useState('');

  useEffect(() => {
    const fetchTime = async () => {
      try {
        // Dynamically get the base URL from the environment
        const baseURL = import.meta.env.VITE_BASE_URL;

        // Fetch time from the backend using the base URL
        const response = await axios.get(`${baseURL}current-time`); // Concatenate with the endpoint

        // Assuming the response is in the format "November 30, 2024 12:48 PM"
        const fullDate = response.data.time;

        // Split the date and time if necessary
        setFormattedTodayDate(fullDate); // Directly set the entire string
      } catch (error) {
        console.error('Error fetching the time:', error);
      }
    };

    // Initial fetch when the component mounts
    fetchTime();

    // Poll every minute to keep it updated
    const intervalId = setInterval(fetchTime, 1000); // Fetch time every 60 seconds

    // Cleanup when component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only on mount and unmount

  return formattedTodayDate;
};

export default useRealTimeDate;
