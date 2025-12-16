import { SignedIn, SignedOut, SignUpButton, useAuth } from '@clerk/clerk-react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import ConversationHistory from './components/ConversationHistory';
import { useEffect, useState } from 'react';
import { api } from './services/api';
import { useChatStore } from './store/chatStore';
import { Menu, X, Wrench, Cpu, Smartphone, Laptop, Zap, Shield, MessageSquare, ArrowRight } from 'lucide-react';

function App() {
  const { getToken, isSignedIn } = useAuth();
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Get currentConversationId from Zustand store
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);
  const startNewConversation = useChatStore((state) => state.startNewConversation);

  // Trigger backend to create user on first sign-in
  useEffect(() => {
    const ensureUserExists = async () => {
      try {
        if (!isSignedIn) return;
        const token = await getToken();
        await api.getUserProfile(token);
      } catch (e) {
        // Silent: backend may be starting up
      }
    };
    ensureUserExists();
  }, [isSignedIn, getToken]);

  const handleSelectConversation = (conversationId) => {
    if (conversationId === null) {
      startNewConversation();
    } else {
      setCurrentConversationId(conversationId);
    }
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <SignedOut>
        {/* Hero Section */}
        <main className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center mb-16">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/30 mb-8 animate-float">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  RepairFix Assistant
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your AI-powered electronics repair guide. Get step-by-step instructions from iFixit, instantly.
              </p>
              
              <SignUpButton mode="modal" forceRedirectUrl="/">
                <button className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105">
                  Start Fixing Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignUpButton>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <FeatureCard 
                icon={<MessageSquare className="w-6 h-6" />}
                title="Ask Anything"
                description="Describe your device problem in plain language. Our AI understands context."
                color="blue"
              />
              <FeatureCard 
                icon={<Wrench className="w-6 h-6" />}
                title="Expert Guides"
                description="Get official iFixit repair guides with detailed steps and images."
                color="indigo"
              />
              <FeatureCard 
                icon={<Zap className="w-6 h-6" />}
                title="Instant Help"
                description="No more searching. Get the exact repair steps you need in seconds."
                color="purple"
              />
            </div>

            {/* Supported Devices */}
            <div className="text-center mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Supports All Your Devices
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <DeviceBadge icon={<Smartphone className="w-5 h-5" />} label="Smartphones" />
                <DeviceBadge icon={<Laptop className="w-5 h-5" />} label="Laptops" />
                <DeviceBadge icon={<Cpu className="w-5 h-5" />} label="Gaming Consoles" />
                <DeviceBadge icon={<Shield className="w-5 h-5" />} label="Tablets" />
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-center text-foreground mb-8">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <StepCard 
                  number="1"
                  title="Describe Your Issue"
                  description="Tell us what's wrong with your device. Be as specific as you like."
                />
                <StepCard 
                  number="2"
                  title="AI Finds the Guide"
                  description="Our AI searches iFixit's database to find the perfect repair guide."
                />
                <StepCard 
                  number="3"
                  title="Follow the Steps"
                  description="Get clear, step-by-step instructions with images to fix your device."
                />
              </div>
            </div>
          </div>
        </main>
      </SignedOut>

      <SignedIn>
        <div className="flex h-[calc(100vh-64px)]">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Sidebar */}
          <aside
            className={`${
              showSidebar ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 fixed md:relative z-40 w-80 bg-card border-r border-border transition-transform duration-300 h-full`}
          >
            <ConversationHistory
              onSelectConversation={handleSelectConversation}
            />
          </aside>

          {/* Main chat area */}
          <main className="flex-1 overflow-hidden bg-background">
            <ChatInterface
              conversationId={currentConversationId}
            />
          </main>
        </div>
      </SignedIn>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
  };

  return (
    <div className="group bg-card rounded-xl border border-border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Device Badge Component
function DeviceBadge({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-secondary-foreground">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

// Step Card Component
function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl rounded-full mb-4 shadow-lg shadow-blue-500/25">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export default App;
