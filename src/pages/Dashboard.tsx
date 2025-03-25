
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Users, QrCode, BarChart3, ArrowRight, CircleAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const DashboardCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  linkText: string;
  className?: string;
}> = ({ title, description, icon, linkTo, linkText, className }) => {
  return (
    <Card className={`hover-lift ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="p-1.5 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="p-0 h-auto text-sm text-primary">
          <Link to={linkTo} className="flex items-center gap-1 hover:gap-2 transition-all">
            {linkText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { role } = useAuth();
  
  return (
    <div className="animate-in">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ClickEvent, your all-in-one event management system.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
              Active Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">154</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check-in Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78%</div>
            <Progress value={78} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(role === 'superadmin') && (
          <DashboardCard
            title="Clubs"
            description="Manage your clubs and organizations"
            icon={<Users className="h-5 w-5" />}
            linkTo="/clubs"
            linkText="Manage clubs"
          />
        )}
        
        {(role === 'superadmin' || role === 'admin') && (
          <DashboardCard
            title="Events"
            description="Create and manage your events"
            icon={<CalendarCheck className="h-5 w-5" />}
            linkTo="/events"
            linkText="Manage events"
          />
        )}
        
        <DashboardCard
          title="Check-in"
          description="Scan QR codes and manage attendees"
          icon={<QrCode className="h-5 w-5" />}
          linkTo="/check-in"
          linkText="Go to check-in"
        />
        
        {(role === 'superadmin' || role === 'admin') && (
          <DashboardCard
            title="Analytics"
            description="View event statistics and reports"
            icon={<BarChart3 className="h-5 w-5" />}
            linkTo="/analytics"
            linkText="View analytics"
          />
        )}
      </div>

      {/* Upcoming Events */}
      <h2 className="text-xl font-bold mt-12 mb-4">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tech Conference 2023</CardTitle>
            <CardDescription>June 15, 2023 • 9:00 AM - 5:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Registrations</span>
              <span className="text-sm font-medium">45/100</span>
            </div>
            <Progress value={45} className="h-2" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CircleAlert className="h-4 w-4 text-amber-500" />
              <span>28 days left</span>
            </div>
            <Button size="sm" asChild>
              <Link to="/events/1">Manage</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Networking Mixer</CardTitle>
            <CardDescription>July 2, 2023 • 6:00 PM - 9:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Registrations</span>
              <span className="text-sm font-medium">32/75</span>
            </div>
            <Progress value={42} className="h-2" />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CircleAlert className="h-4 w-4 text-amber-500" />
              <span>45 days left</span>
            </div>
            <Button size="sm" asChild>
              <Link to="/events/2">Manage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
