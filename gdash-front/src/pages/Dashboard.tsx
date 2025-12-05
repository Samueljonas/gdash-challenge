import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CloudRain,
  Droplets,
  Thermometer,
  LogOut,
  Download,
  Bot,
} from "lucide-react";

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

// --- INTERFACES (Data Contracts) ---

interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  timestamp: string;
}

interface InsightsData {
  summary: string;
  alerts: string[];
}

export default function Dashboard() {
  const navigate = useNavigate();

  // --- STATES ---
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<InsightsData>({
    summary: "Loading smart analysis...",
    alerts: [],
  });

  // --- SECURITY AND HELPER FUNCTIONS ---

  // 1. Logout Function
  const handleLogout = () => {
    localStorage.removeItem("gdash_token");
    localStorage.removeItem("gdash_user");
    navigate("/");
  };

  // 2. Secure Fetch (Fetches JSON data with Token)
  const fetchProtectedData = async (url: string) => {
    const token = localStorage.getItem("gdash_token");

    if (!token) {
      navigate("/");
      return null;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Request error:", error);
      return null;
    }
  };

  // 3. CSV Export (New Logic)
  const handleExportCsv = async () => {
    const token = localStorage.getItem("gdash_token");
    if (!token) return;

    try {
      // We fetch the download route
      const response = await fetch(
        "http://localhost:3000/api/weather/export/csv",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Needs the token to download!
          },
        }
      );

      if (response.status === 401) {
        handleLogout();
        return;
      }

      // Converts the response into a file (Blob)
      const blob = await response.blob();

      // Creates a temporary link in the browser to start the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Defines the file name with today's date
      a.download = `gdash_report_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);

      // Clicks the link and cleans up the mess
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Error exporting file.");
    }
  };

  // --- LIFECYCLE ---

  useEffect(() => {
    // Fetch Logs
    fetchProtectedData("http://localhost:3000/api/weather/logs").then(
      (data) => {
        if (data) setLogs(data);
      }
    );

    // Fetch Insights
    fetchProtectedData("http://localhost:3000/api/weather/insights").then(
      (data) => {
        if (data) setInsights(data);
      }
    );
  }, []);

  // --- VISUAL DATA ---

  const current = logs[0] || { temperature: 0, humidity: 0, precipitation: 0 };

  const chartData = [...logs]
    .slice(0, 20)
    .reverse()
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temp: log.temperature,
      humidity: log.humidity,
    }));

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50/50 p-8">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            GDash Weather
          </h1>
          <p className="text-slate-500">Secure real-time monitoring.</p>
        </div>
        <div className="flex gap-2">
          {/* CSV Button connected to the handleExportCsv function */}
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* BLOCK 1: KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Temperature
              </CardTitle>
              <Thermometer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{current.temperature}°C</div>
              <p className="text-xs text-muted-foreground">Real-Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Relative Humidity
              </CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{current.humidity}%</div>
              <p className="text-xs text-muted-foreground">Environment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Precipitation
              </CardTitle>
              <CloudRain className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {current.precipitation} mm
              </div>
              <p className="text-xs text-muted-foreground">Accumulated</p>
            </CardContent>
          </Card>
        </div>

        {/* BLOCK 2: Chart and AI */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Trend (Last Readings)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}°C`}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#f97316"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 bg-indigo-50 border-indigo-100">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-indigo-900">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border border-indigo-100">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-indigo-600">
                      Summary:
                    </span>{" "}
                    {insights.summary}
                  </p>
                </div>
                {insights.alerts.length > 0 ? (
                  insights.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg shadow-sm border border-amber-100"
                    >
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-amber-600">
                          Alert:
                        </span>{" "}
                        {alert}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-indigo-400 border border-dashed border-indigo-200 rounded-lg">
                    No critical alerts.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BLOCK 3: History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead className="text-right">Rain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 5).map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {new Date(log.timestamp).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell>{log.temperature}°C</TableCell>
                    <TableCell>{log.humidity}%</TableCell>
                    <TableCell className="text-right">
                      {log.precipitation}mm
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
