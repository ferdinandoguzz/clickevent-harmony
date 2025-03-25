
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Users, QrCode, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Feature: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ 
  title, 
  description, 
  icon 
}) => {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="p-2 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simplify Your Event Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ClickEvent helps you create, manage, and track events with powerful QR code check-in technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-full bg-primary/10 text-primary">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Event Creation</CardTitle>
              <CardDescription>
                Create and customize events with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Set up your event with all the details your attendees need to know including capacity, location, and pricing.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="p-0 h-auto text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-full bg-primary/10 text-primary">
                <QrCode className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">QR Ticketing</CardTitle>
              <CardDescription>
                Seamless check-in experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate unique QR codes for each attendee and scan them for quick and efficient check-in at your events.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="p-0 h-auto text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-full bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4">Analytics</CardTitle>
              <CardDescription>
                Insights for better events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track registrations, check-ins, and other key metrics to understand your event performance.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="p-0 h-auto text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="py-10">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ClickEvent?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Feature 
              title="Streamlined Registration" 
              description="Customize registration forms to collect exactly the information you need from attendees."
              icon={<Users className="h-6 w-6" />}
            />
            <Feature 
              title="Efficient Check-in" 
              description="Speed up the entry process with our QR code scanning system."
              icon={<QrCode className="h-6 w-6" />}
            />
            <Feature 
              title="Real-time Tracking" 
              description="Monitor attendance and check-in status in real-time from any device."
              icon={<BarChart3 className="h-6 w-6" />}
            />
            <Feature 
              title="Comprehensive Analytics" 
              description="Get valuable insights to help improve your future events."
              icon={<CheckCircle className="h-6 w-6" />}
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Elevate Your Events?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event planners who trust ClickEvent for their event management needs.
          </p>
          <Button asChild size="lg">
            <Link to="/login">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">© {new Date().getFullYear()} ClickEvent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
