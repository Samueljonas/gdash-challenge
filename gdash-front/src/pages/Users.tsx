import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react"; // Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interface for User Data
interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  // --- SECURITY CHECK & FETCH ---
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("gdash_token");

      if (!token) {
        navigate("/"); // Kick out if no token
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          navigate("/"); // Token expired
          return;
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    fetchUsers();
  }, [navigate]);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("gdash_token");
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update UI by removing the deleted user from state (no need to reload)
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Error deleting user");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
