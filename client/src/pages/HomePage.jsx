
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
// Lucide icons
import { Zap, Code, Users, LogIn, UserPlus, Send, MessageSquare, LayoutDashboard, LogOut } from 'lucide-react'; 
// Imports from your local shadcn/ui components folder
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// --- Local Navbar Component (Conceptual - Should be in App.jsx or Layout) ---
const Header = () => { 
  const {isLoggedIn, logout} = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  }

  return(
  <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Brand Logo - Navigates to Home */}
                <div 
                    onClick={() => navigate('/')} 
                    className="text-2xl font-bold text-indigo-600 cursor-pointer"
                >
                    QuillJot<span className="text-gray-900">.ai</span>
                </div>
                
                <nav className="flex items-center space-x-2">
                    {isLoggedIn ? (
                        <>
                            {/* Logged-In State */}
                            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                                <LayoutDashboard size={18} className="mr-2" /> Dashboard
                            </Button>
                            <Button 
                                onClick={handleLogout} 
                                className="bg-red-500 hover:bg-red-600 text-white shadow-md"
                            >
                                <LogOut size={18} className="mr-2" /> Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Logged-Out State */}
                            <Button variant="ghost" onClick={() => navigate('/login')}>
                                <LogIn size={18} className="mr-2" /> Log In
                            </Button>
                            <Button 
                                onClick={() => navigate('/register')} 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                            >
                                <UserPlus size={18} className="mr-2" /> Sign Up
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
);
}

// --- Feature Component (Enhanced with Hover Effect) ---
const FeatureCard = ({ icon, title, description }) => (
  // Applying a subtle tilt/lift on hover, inspired by Reactbits' Tilted Card aesthetic
  <Card className="flex flex-col items-center text-center p-8 h-full transition-all duration-500 hover:shadow-2xl hover:border-indigo-400 border-2 border-transparent">
    <CardContent className="p-0 flex flex-col items-center">
      <div className="text-indigo-600 bg-indigo-50 p-3 rounded-full mb-4 shadow-lg">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);


const HomePage = () => {
  const navigate = useNavigate();

  const handleAuthNavigation = (route) => {
    navigate(route)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar Inclusion */}
      <Header />

      {/* 1. Hero Section - With Background Effect */}
      <section className="relative py-32 md:py-48 text-center overflow-hidden 
                         bg-gradient-to-br from-indigo-100 via-white to-sky-100 
                         border-b-4 border-indigo-300"> 
        {/* Enhanced Background Overlays (Inspired by Reactbits dynamic backgrounds) */}
        {/* Layer 1: Subtle Gradient Radial Glows */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
            <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Layer 2: Subtle Geometric Pattern (Dot Grid) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-10">
             <div className="w-full h-full bg-[radial-gradient(#a5b4fc_1px,transparent_1px)] [background-size:20px_20px]"></div> {/* Lighter indigo dots */}
        </div>

        {/* Content remains on top */}
        <div className="max-w-5xl mx-auto px-4 relative z-20"> {/* Increased z-index for content */}
          <div className="inline-block mb-10">
              <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full px-4 py-1.5 text-sm font-medium 
                             text-indigo-700 bg-indigo-100 border-indigo-400 
                             shadow-md hover:bg-indigo-200 transition-colors"
                  // Use a placeholder icon to draw attention
              >
                  <Zap size={16} className="mr-2 fill-indigo-500 text-indigo-500" /> 
                  NEW: Gemini AI Content Integration
              </Button>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">
            The <span className="text-indigo-700">AI-First</span> Writing Engine
          </h1>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto font-medium">
            Generate, Edit, and Publish. Seamlessly integrate Gemini AI with a powerful MERN stack for content excellence.
          </p>
          <Button 
            onClick={() => handleAuthNavigation('/register')}
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-500/50 text-lg px-10 py-7 rounded-full transition-all duration-300 transform hover:scale-[1.05]"
            size="lg"
          >
            <UserPlus size={20} className="mr-2" /> Start Publishing Free
          </Button>
        </div>
      </section>

      {/* 2. Enhanced Feature Showcase */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
          Tools Built for the Future of Publishing
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Zap size={30} />}
            title="Gemini AI Content Integration"
            description="Use AI to brainstorm, expand, and refine your posts instantly. From outline to article in minutes."
          />
          <FeatureCard 
            icon={<Code size={30} />}
            title="Tiptap: Rich & Clean Editing"
            description="Enjoy a customizable, distraction-free WYSIWYG editor that handles complex formatting with ease."
          />
          <FeatureCard 
            icon={<Users size={30} />}
            title="Secure & Scalable MERN Stack"
            description="Built for reliability and speed using MongoDB, Express, React, and Node, secured with Passport."
          />
        </div>
      </section>
      
      {/* 3. Testimonials Section (New) */}
      <section className="py-20 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
              Trusted by Leading Content Creators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6">
                    <MessageSquare size={24} className="text-yellow-500 mb-3" />
                    <p className="italic text-gray-700 mb-4">"The AI features are a game-changer. I cut my first draft time by 50% without sacrificing quality."</p>
                    <p className="font-semibold text-sm">— Taylor H., Tech Blogger</p>
                </Card>
                <Card className="p-6">
                    <MessageSquare size={24} className="text-yellow-500 mb-3" />
                    <p className="italic text-gray-700 mb-4">"Deployment and content management is flawlessly simple. Truly production-ready from day one."</p>
                    <p className="font-semibold text-sm">— Alex V., Marketing Director</p>
                </Card>
                <Card className="p-6">
                    <MessageSquare size={24} className="text-yellow-500 mb-3" />
                    <p className="italic text-gray-700 mb-4">"The editor is the best I've ever used. So clean and all the tools I need are right there."</p>
                    <p className="font-semibold text-sm">— Jamie L., Freelance Writer</p>
                </Card>
            </div>
        </div>
      </section>

      {/* 4. Contact Us/Final CTA Section (New) */}
      <section className="py-20 md:py-28 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">
          Ready to Elevate Your Writing?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Contact us with any questions, or just hit the button to start your free account!
        </p>
        <div className="flex justify-center space-x-4">
            <Button 
                onClick={() => handleAuthNavigation('/contact')}
                variant="outline"
                className="text-indigo-600 border-indigo-400 hover:bg-indigo-50"
            >
                <Send size={18} className="mr-2" /> Contact Sales
            </Button>
            <Button 
                onClick={() => handleAuthNavigation('/register')}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
                <LogIn size={18} className="mr-2" /> Create Free Account
            </Button>
        </div>
      </section>


      {/* 5. Footer */}
      <Separator className="bg-gray-200" />
      <footer className="py-12 bg-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} QuillJot.ai. All rights reserved. 
            <span className="mx-2">|</span> 
            <a href="#" className="hover:underline text-indigo-600">Terms & Privacy</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;