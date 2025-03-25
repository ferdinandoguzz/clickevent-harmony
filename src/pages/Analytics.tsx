
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, PieChart as PieChartIcon, Calendar, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock event data
const mockEvents = [
  { id: '1', name: 'Tech Conference 2023' },
  { id: '2', name: 'Networking Mixer' },
  { id: '3', name: 'Art Exhibition' },
  { id: '4', name: 'Wellness Workshop' },
  { id: '5', name: 'Leadership Seminar' },
];

// Mock registration data by date
const mockRegistrationData = [
  { date: 'May 1', registrations: 5, checkins: 0 },
  { date: 'May 2', registrations: 8, checkins: 0 },
  { date: 'May 3', registrations: 12, checkins: 0 },
  { date: 'May 4', registrations: 10, checkins: 0 },
  { date: 'May 5', registrations: 15, checkins: 0 },
  { date: 'May 6', registrations: 20, checkins: 0 },
  { date: 'May 7', registrations: 17, checkins: 0 },
  { date: 'May 8', registrations: 25, checkins: 0 },
  { date: 'May 9', registrations: 22, checkins: 0 },
  { date: 'May 10', registrations: 30, checkins: 0 },
  { date: 'May 11', registrations: 35, checkins: 0 },
  { date: 'May 12', registrations: 40, checkins: 0 },
  { date: 'May 13', registrations: 38, checkins: 0 },
  { date: 'May 14', registrations: 42, checkins: 0 },
  { date: 'May 15', registrations: 50, checkins: 0 },
  { date: 'Jun 15', registrations: 0, checkins: 42 },
  { date: 'Jun 16', registrations: 0, checkins: 8 },
];

// Mock source data
const mockSourceData = [
  { name: 'Direct Link', value: 45 },
  { name: 'Social Media', value: 25 },
  { name: 'Email', value: 20 },
  { name: 'Partner Sites', value: 10 },
];

// Mock attendee demographics
const mockDemographicsData = [
  { name: 'Software Engineer', value: 30 },
  { name: 'Product Manager', value: 20 },
  { name: 'Data Scientist', value: 15 },
  { name: 'Designer', value: 12 },
  { name: 'Marketing', value: 10 },
  { name: 'Sales', value: 8 },
  { name: 'Other', value: 5 },
];

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8', '#82CA9D'];

const Analytics: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [chartType, setChartType] = useState('registrations');

  // Filter registration data based on selected date range
  const filteredData = mockRegistrationData.slice(-parseInt(dateRange));

  const handleExport = () => {
    toast({
      title: "Analytics exported",
      description: "The analytics data has been exported as a CSV file."
    });
  };

  return (
    <div className="animate-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your event performance.</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">421</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check-in Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">76%</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 bg-white p-4 rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
          <div className="w-full md:w-auto md:flex-1 space-y-2">
            <Label htmlFor="event-select">Event</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger id="event-select">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {mockEvents.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="date-range" className="w-full md:w-[180px]">
                <SelectValue placeholder="Select a date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="icon" className="flex-shrink-0 md:mb-0">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
        
        <Tabs value={chartType} onValueChange={setChartType} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="registrations">
              <BarChart3 className="mr-2 h-4 w-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="checkins">
              <Calendar className="mr-2 h-4 w-4" />
              Check-ins
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mt-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartType === 'registrations' ? (
                <Bar 
                  dataKey="registrations" 
                  name="Registrations" 
                  fill="#0088FE" 
                  radius={[4, 4, 0, 0]} 
                />
              ) : (
                <Bar 
                  dataKey="checkins" 
                  name="Check-ins" 
                  fill="#00C49F" 
                  radius={[4, 4, 0, 0]} 
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registration Sources</CardTitle>
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Where attendees are registering from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendee Demographics</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Job roles of registered attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockDemographicsData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    name="Attendees" 
                    fill="#8884D8" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
