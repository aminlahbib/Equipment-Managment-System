import React from 'react';
import { ChevronRight, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingProps {
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-background text-text-primary relative overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-background rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-text-primary">Equip</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex text-text-secondary hover:text-text-primary">
            Documentation
          </Button>
          <Button variant="secondary" onClick={onLogin} className="group">
            Sign In <ChevronRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative pt-32 pb-16 px-6 sm:pt-48 sm:pb-24 lg:pb-32 max-w-7xl mx-auto text-center z-10">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-medium text-text-secondary mb-8">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            v2.0 Now Available
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-text-primary">
            Manage Equipment.<br />
            <span className="text-text-tertiary">Effortlessly.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary mb-12 leading-relaxed">
            The modern way to track inventory, manage loans, and streamline your organization's equipment workflow. Designed for speed and precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={onLogin} className="w-full sm:w-auto h-12">
              Get Started
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto h-12">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-text-secondary/20 transition-colors">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">Lightning Fast</h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              Instant search and booking. Built on a modern stack for zero latency interactions.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-text-secondary/20 transition-colors">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 text-purple-500">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">Enterprise Secure</h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              Role-based access control and detailed audit logs keep your inventory safe.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-text-secondary/20 transition-colors">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-6 text-orange-500">
              <Globe size={20} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-text-primary">Accessible Anywhere</h3>
            <p className="text-text-secondary leading-relaxed text-sm">
              Cloud-native architecture means you can manage your gear from any device.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 border-t border-border pt-8 text-sm text-text-tertiary flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2024 Equip Systems Inc. Designed with precision.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-text-primary transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

