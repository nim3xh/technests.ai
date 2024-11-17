import { React, useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
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
  Dropdown
} from "flowbite-react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle, HiPlusCircle } from "react-icons/hi";
import axios from "axios";
import { FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const BaseURL = import.meta.env.VITE_BASE_URL;

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [editUser, setEditUser] = useState(false);
  const [editUserDetails, setEditUserDetails] = useState({});
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    apexAccountNumber: "",
    email: "",
    password: "",
    role: "admin", // Default role
  });
  const [uniqueAccountNumbers, setUniqueAccountNumbers] = useState([]);

  const fetchData = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const usersResponse = await axios.get(`${BaseURL}userCredentials`, {
        headers,
      });
      setUserData(usersResponse.data);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while fetching data.");
      setLoading(false);
    }
  };

  // Helper function to merge users and accountDetails based on accountNumber
  const mergeData = (users, accountDetails) => {
    return accountDetails.map((account) => {
      const user = users.find((u) => u.accountNumber === account.accountNumber);
      return {
        ...account,
        name: user ? user.name : "Unknown",
      };
    });
  };

  const fetchUniqueApexAccountNumber = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      // Fetch only user data
      const usersResponse = await axios.get(`${BaseURL}users`, { headers });
      const userData = usersResponse.data;
  
      // Create a Set to track encountered APEX account numbers
      const encounteredAccounts = new Set();
  
      // Extract and filter unique APEX account numbers
      const uniqueApexAccounts = userData
        .filter((user) => user.accountNumber.startsWith("APEX-"))
        .map((user) => {
          const accountNumber = user.accountNumber;
          if (!encounteredAccounts.has(accountNumber)) {
            encounteredAccounts.add(accountNumber);
            return `${accountNumber} (${user.name})`;
          }
          return null;
        })
        .filter(Boolean); // Filter out null values
  
      return uniqueApexAccounts;
    } catch (error) {
      console.error("Error fetching unique APEX account numbers:", error);
      return [];
    }
  };
  
  useEffect(() => {
    fetchData();

    const getUniqueApexAccounts = async () => {
      const accounts = await fetchUniqueApexAccountNumber();
      setUniqueAccountNumbers(accounts);
    };

    getUniqueApexAccounts();
  }, [currentUser]);

  const handleAddUser = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.post(`${BaseURL}userCredentials`, newUser, { headers });
      setShowAddModal(false); // Close modal on success
      fetchData(); // Refresh user data after adding a new user
    } catch (err) {
      setError("Error adding user.");
    }
  };

  const handleEditUser = async () => {
    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      await axios.patch(
        `${BaseURL}userCredentials/${editUserDetails.id}`,
        editUserDetails,
        { headers }
      );
      setShowEditModal(false); // Close modal on success
      fetchData(); // Refresh user data after editing
    } catch (err) {
      setError("Error updating user.");
    }
  };

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditUserDetails({
      ...editUserDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return; // If the user cancels, do nothing.
    }

    try {
      const token = currentUser.token;
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await axios.delete(`${BaseURL}userCredentials/${id}`, { headers });

      // Refresh user data after deletion
      fetchData();
    } catch (err) {
      setError("Error deleting user.");
    }
  };

  function getUserRoleDisplay(role) {
    switch (role) {
      case "admin":
        return "Admin";
      case "user":
        return "User";
      case "super-user":
        return "Super User";
      default:
        return "Unknown Role";
    }
  }

  return (
    <div className="p-3 w-full">
      <Breadcrumb aria-label="Default breadcrumb example">
        <Breadcrumb.Item href="/dashboard?tab=dash" icon={HiHome}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item>Users</Breadcrumb.Item>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-3">
        <h1 className="mt-3 mb-3 text-left font-semibold text-xl">All Users</h1>
        {currentUser.user.role === "admin" && (
          <Button
            gradientDuoTone="greenToBlue"
            onClick={() => setShowAddModal(true)}
            className="ml-3"
          >
            <HiPlusCircle className="mr-2 h-6 w-4" />
            Add New User
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <Table hoverable className="shadow-md w-full">
          <TableHead>
            <TableHeadCell>First Name</TableHeadCell>
            <TableHeadCell>Last Name</TableHeadCell>
            <TableHeadCell>Account Number</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell></TableHeadCell>
          </TableHead>
          <TableBody>
            {userData.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.FirstName}</TableCell>
                <TableCell>{user.LastName}</TableCell>
                <TableCell>{user.ApexAccountNumber}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getUserRoleDisplay(user.role)}</TableCell>
                <TableCell>
                  {currentUser.user.role === "admin" && (
                    <Button.Group>
                      <Button
                        outline
                        gradientDuoTone="greenToBlue"
                        onClick={() => {
                          setEditUserDetails(user);
                          setShowEditModal(true);
                        }}
                      >
                        <FaUserEdit className="mr-3 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        outline
                        gradientDuoTone="pinkToOrange"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={!!(currentUser.user.email === user.email)}
                      >
                        <MdDeleteForever className="mr-3 h-4 w-4" />
                        Delete
                      </Button>
                    </Button.Group>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal for Adding User */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
        <Modal.Header>Add New User</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="firstName" value="First Name" />
              <TextInput
                id="firstName"
                name="firstName"
                value={newUser.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" value="Last Name" />
              <TextInput
                id="lastName"
                name="lastName"
                value={newUser.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="apexAccountNumber" value="Apex Account Number" />
              <Dropdown
                label={newUser.apexAccountNumber || "Select Account"}
                className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
                inline
              >
                {uniqueAccountNumbers.map((account) => (
                  <Dropdown.Item
                    key={account}
                    onClick={() => {
                      // Extract the account number before the first space
                      const extractedAccountNumber = account.split(" ")[0];
                      setNewUser((prevState) => ({
                        ...prevState,
                        apexAccountNumber: extractedAccountNumber,
                      }));
                    }}
                  >
                    {account}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            </div>
            <div>
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password" value="Password" />
              <TextInput
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="role" value="Role" />
              <Select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="super-user">Super User</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddUser}>Add User</Button>
          <Button onClick={() => setShowAddModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Editing User */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit User</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="firstName" value="First Name" />
              <TextInput
                id="firstName"
                name="FirstName"
                value={editUserDetails.FirstName || ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" value="Last Name" />
              <TextInput
                id="lastName"
                name="LastName"
                value={editUserDetails.LastName || ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="apexAccountNumber" value="Apex Account Number" />
              <Dropdown
                label={newUser.apexAccountNumber || "Select Account"}
                className="w-full text-left dark:bg-gray-800 dark:text-gray-200"
                inline
              >
                {uniqueAccountNumbers.map((account) => (
                  <Dropdown.Item
                    key={account}
                    onClick={() => {
                      // Extract the account number before the first space
                      const extractedAccountNumber = account.split(" ")[0];
                      setNewUser((prevState) => ({
                        ...prevState,
                        apexAccountNumber: extractedAccountNumber,
                      }));
                    }}
                  >
                    {account}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            </div>
            <div>
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                name="email"
                type="email"
                value={editUserDetails.email || ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="role" value="Role" />
              <Select
                id="role"
                name="role"
                value={editUserDetails.role || ""}
                onChange={handleEditChange}
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="super-user">Super User</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleEditUser}>Save Changes</Button>
          <Button onClick={() => setShowEditModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
