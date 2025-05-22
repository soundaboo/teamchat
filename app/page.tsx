import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquareIcon, Users2Icon, ShieldIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <MessageSquareIcon className="h-6 w-6 text-primary" />
            <span>TeamChat</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Communicate with your team in real-time
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
              A secure, real-time chat platform designed for teams. Create channels, send direct messages, and keep your team connected.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Log in</Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <MessageSquareIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
                <p className="text-muted-foreground">
                  Instant messaging with real-time updates so your team is always in sync.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <Users2Icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Channels & Groups</h3>
                <p className="text-muted-foreground">
                  Organize conversations by topic with public and private channels.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm">
                <ShieldIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure Communication</h3>
                <p className="text-muted-foreground">
                  Your team's conversations stay private and secure.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TeamChat. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}