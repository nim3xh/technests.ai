import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiHome } from "react-icons/hi";
import { Breadcrumb } from "flowbite-react";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashboardCompUser() {
  const { currentUser } = useSelector((state) => state.user);

  // Generate the calendar days for the current month
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11 (January to December)
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const firstDayIndex = firstDayOfMonth.getDay(); // 0 - Sunday, 1 - Monday, ...
    const lastDate = lastDayOfMonth.getDate(); // Last date of the month

    // Create an array of days in the month, including padding for first week
    const calendarDays = [];
    
    // Add padding for the first week
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push(null);
    }

    // Add actual days of the month
    for (let i = 1; i <= lastDate; i++) {
      calendarDays.push(i);
    }

    return calendarDays;
  };

  // Get the current month name and year
  const getMonthAndYear = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const today = new Date();
    const monthName = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return { monthName, year };
  };

  const calendarDays = generateCalendar();
  const { monthName, year } = getMonthAndYear();

  const todayDate = new Date().getDate();
  const currentDayOfWeek = new Date().getDay(); // 0 - Sunday, 6 - Saturday

  const handleDateClick = (day, index) => {
    if (day && index % 7 !== 0 && index % 7 !== 6) { // Check if the day is not Saturday or Sunday
      alert(`Selected day: ${day}`);
    }
  };

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

      {/* Calendar Section */}
      <div className="mt-8">
        <div className="text-xl font-semibold text-center mb-4">
          {monthName} {year}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Days of the week header */}
          <div className="text-center font-bold">Sun</div>
          <div className="text-center font-bold">Mon</div>
          <div className="text-center font-bold">Tue</div>
          <div className="text-center font-bold">Wed</div>
          <div className="text-center font-bold">Thu</div>
          <div className="text-center font-bold">Fri</div>
          <div className="text-center font-bold">Sat</div>

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            // Determine if the current day is a weekend
            const isWeekend = index % 7 === 0 || index % 7 === 6;

            return (
              <div
                key={index}
                className={`p-2 text-center cursor-pointer rounded-md ${
                  day === null
                    ? "opacity-0"
                    : day === todayDate && isWeekend
                    ? "bg-gray-400 text-blue-900" // Mixed gray and blue for today if it's a weekend
                    : day === todayDate
                    ? "bg-blue-800 text-white" // Dark blue for today if it's a weekday
                    : isWeekend
                    ? "bg-gray-300 text-gray-500" // Grayed-out weekends
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
                onClick={() => handleDateClick(day, index)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}