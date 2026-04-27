import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, ComposedChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  LayoutDashboard, Briefcase, User, Settings, Search, Filter, MapPin, Clock, ChevronRight, Star, CheckCircle, AlertCircle, Plus, Users, BarChart3, ShieldCheck, FileText, Mail, ArrowLeft, Download, Calendar, MoreVertical, LogOut, Menu, X, TrendingUp, Award, Zap, ChevronDown, DollarSign, Trash2, Edit2, Save, Globe, BrainCircuit, MessageCircle, Eye, Bot, Send, Sparkles, Loader2, Wand2, ThumbsUp, Bookmark, Trophy, Share2, GraduationCap, ClipboardList, Target, Layers, History, Lock, UserCheck, Rocket, BookOpen, MessageSquare, Lightbulb, School, Bell, CheckSquare, AlertTriangle, FileCheck, Scale, Gavel, UserPlus, Grid, Code, PenTool, Hash, Moon, Sun, Activity
} from 'lucide-react';

// --- GEMINI API CONFIG ---
const apiKey = ""; 

async function callGemini(prompt, systemInstruction = "") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
  };

  const maxRetries = 3; 
  let delay = 1000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      if (i === maxRetries - 1) return "I'm having trouble connecting to the AI network right now. Please try again.";
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// --- CONSTANTS & MOCK DATA ---
const DEMO_CREDENTIALS = {
  student: { email: 'student@example.com', password: 'password123' },
  employer: { email: 'employer@example.com', password: 'password123' },
  admin: { email: 'admin@example.com', password: 'password123' }
};

// Sanitized Data (Identity Neutral)
const INITIAL_DATA = {
  opportunities: [
    { id: 1, company: "TechCorp", role: "React Developer Intern", logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop", salary: { min: 25, max: 45 }, location: "Metro City", type: "Internship", apps: 45, matchScore: 85, rating: 4.5, description: "Build modern React applications using cutting-edge technologies. Focus on component architecture and state management.", skillsRequired: ["React", "Node.js", "TypeScript"], yourSkills: ["React", "Node.js"], duration: "6 months", reviews: 234, source: 'company' },
    { id: 2, company: "StartupXYZ", role: "Full Stack Developer", logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop", salary: { min: 35, max: 60 }, location: "Innovation Hub", type: "Full-Time", apps: 12, matchScore: 78, rating: 4.2, description: "Scale our backend infrastructure with Node.js and Postgres. Work on high-traffic APIs and database optimization.", skillsRequired: ["React", "Node.js", "MongoDB", "Docker"], yourSkills: ["React", "Node.js", "MongoDB"], duration: "3 months", reviews: 156, source: 'company' },
    { id: 3, company: "Global Tech", role: "Backend Intern", logo: "https://images.unsplash.com/photo-1516534775068-bb57e39c146f?w=100&h=100&fit=crop", salary: { min: 40, max: 60 }, location: "Tech Park", type: "Internship", apps: 89, matchScore: 91, rating: 4.8, description: "Join a fast-paced environment building user-centric features. Full ownership from DB to UI.", skillsRequired: ["DSA", "System Design", "API Design"], yourSkills: ["DSA"], duration: "6 months", reviews: 567, source: 'company' },
    { id: 4, company: "Dept. of Computer Science", role: "AI Research Assistant", logo: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=100&h=100&fit=crop", location: "On Campus", salary: { min: 10, max: 15 }, type: "Research", duration: "3 months", skillsRequired: ["Python", "PyTorch", "Linear Algebra"], yourSkills: ["Python"], matchScore: 94, rating: 4.9, reviews: 12, applicants: 56, source: 'faculty' },
    { id: 5, company: "CloudInc", role: "Cloud Engineer", logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop", location: "Remote", salary: { min: 45, max: 75 }, type: "Full-Time", duration: "Permanent", skillsRequired: ["Node.js", "MongoDB", "AWS"], yourSkills: ["Node.js", "MongoDB"], matchScore: 81, rating: 4.4, reviews: 201, applicants: 34, source: 'company' }
  ],
  communityPosts: [
    { id: 1, author: "Rahul D.", role: "Student", title: "TechCorp Interview Experience - Round 1", content: "Just finished the coding round. Focus heavily on sliding window problems!", likes: 45, comments: 12, tags: ["Interview", "TechCorp"] },
    { id: 2, author: "Prof. Sarah Jen", role: "Faculty", title: "Research Paper Publication Opportunity", content: "Looking for 2 students to collaborate on an ML paper for IEEE conference. Contact me if interested.", likes: 89, comments: 24, tags: ["Research", "Opportunity"] },
    { id: 3, author: "System", role: "Admin", title: "Campus Drive Policy Update", content: "All students must have a minimum 75% attendance to sit for Tier-1 companies.", likes: 156, comments: 0, tags: ["Policy", "Notice"] }
  ],
  prepHub: {
    companies: [
      { id: 1, name: 'TechCorp', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop', rating: 4.5, reviews: 234, interviewCount: 89, successRate: 23, avgProcessDays: 22, rounds: ['Technical Round 1', 'Technical Round 2', 'HR Round'], difficulty: 'Medium', mostAsked: ['React', 'System Design', 'DSA'], description: 'Fast growing B2B SaaS startup.', hiring: true, positions: 3 },
      { id: 2, name: 'Global Tech', logo: 'https://images.unsplash.com/photo-1516534775068-bb57e39c146f?w=100&h=100&fit=crop', rating: 4.8, reviews: 567, interviewCount: 234, successRate: 18, avgProcessDays: 45, rounds: ['Phone Screen', 'Technical Round 1', 'Technical Round 2', 'Technical Round 3', 'HR'], difficulty: 'Hard', mostAsked: ['DSA', 'System Design', 'API Design'], description: 'Global Tech Giant.', hiring: true, positions: 5 },
    ],
    questions: [
      { id: 1, company: 'TechCorp', category: 'React', difficulty: 'Medium', question: 'Explain the difference between useState and useReducer', answer: 'useState is simpler for single values, useReducer is better for complex state logic.', likedBy: 234, solved: 89, comments: 12, resources: ['React Docs', 'YouTube Tutorial'], followUp: ['How to optimize useReducer?', 'When use Context with useReducer?'] },
      { id: 2, company: 'Global Tech', category: 'DSA', difficulty: 'Hard', question: 'Design a system to count frequent elements in a stream', answer: 'Use a min-heap with frequency map. Maintain top-k elements using heap of size k.', likedBy: 567, solved: 234, comments: 45, resources: ['LeetCode 347', 'Algorithm Video'], followUp: ['What if k changes?', 'Memory constraints?'] }
    ]
  },
  teamFormation: {
    availableTeams: [
      { 
        id: 1, 
        name: "Neural Net Ninjas", 
        focus: "AI/ML Hackathon", 
        members: [
          { name: "Alex M.", role: "ML Engineer", avatar: "A" },
          { name: "Sam K.", role: "Backend", avatar: "S" }
        ], 
        lookingFor: ["Frontend", "Designer"], 
        matchScore: 94, 
        matchReason: "Needs your React Skills",
        description: "Building a gesture-based control system for smart homes." 
      },
      { 
        id: 2, 
        name: "BlockChain Gang", 
        focus: "DeFi Project", 
        members: [
          { name: "Jordan P.", role: "Blockchain Dev", avatar: "J" }
        ], 
        lookingFor: ["Frontend", "Backend", "Designer"], 
        matchScore: 82, 
        matchReason: "Complementary Tech Stack",
        description: "Decentralized lending platform for student loans." 
      }
    ],
    suggestedTeammates: [
      { id: 1, name: "Priya P.", role: "UI/UX Designer", skills: ["Figma", "Adobe XD"], compatibility: 98, status: "Looking for Team", avatar: "P" },
      { id: 2, name: "Kiran R.", role: "Frontend Dev", skills: ["React", "Three.js"], compatibility: 85, status: "Open to invites", avatar: "K" }
    ]
  },
  applications: [
    { 
      id: 1, 
      company: "TechCorp", 
      role: "React Developer Intern", 
      logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop",
      status: "shortlisted", 
      matchScore: 85, 
      appliedDate: "Dec 20",
      lastUpdate: "Yesterday",
      location: "Metro City",
      timeline: [
        { event: "Applied", date: "Dec 20", status: 'done', icon: '✓' },
        { event: "Under Review", date: "Dec 21", status: 'done', icon: '✓' },
        { event: "Shortlisted", date: "Dec 21", status: 'done', icon: '✓' },
        { event: "Interview", date: "TBD", status: 'pending', icon: '○' }
      ]
    }
  ],
  adminStats: {
    growth: [{ month: 'Jan', users: 1200 }, { month: 'Feb', users: 1800 }, { month: 'Mar', users: 2500 }, { month: 'Apr', users: 3100 }, { month: 'May', users: 3800 }, { month: 'Jun', users: 4231 }],
    skillsGap: [
      { skill: 'React', supply: 85, demand: 90 },
      { skill: 'Python', supply: 60, demand: 75 },
      { skill: 'AWS', supply: 40, demand: 85 },
      { skill: 'System Design', supply: 30, demand: 80 },
    ],
    domainDist: [
      { name: 'Software', value: 450 },
      { name: 'Data Sci', value: 300 },
      { name: 'Product', value: 150 },
      { name: 'Design', value: 100 },
    ],
    kpis: [
      { label: "Placement Rate", value: "89.2%", trend: "+2.4%", icon: Trophy, color: "green" },
      { label: "Fairness Score", value: "98/100", trend: "High", icon: Scale, color: "indigo" },
      { label: "Active Drives", value: "24", trend: "+3", icon: Briefcase, color: "blue" },
      { label: "Pending Approvals", value: "05", trend: "Urgent", icon: AlertTriangle, color: "amber" },
    ],
    approvals: [
      { id: 1, type: "Drive", entity: "FinTech Global", title: "Graduate Analyst Hire", date: "Today", status: "Pending" },
      { id: 2, type: "Question", entity: "TechCorp", title: "Advanced Graph Theory", date: "Yesterday", status: "Flagged" },
      { id: 3, type: "Drive", entity: "StartupXYZ", title: "Marketing Intern", date: "Yesterday", status: "Pending" }
    ],
    logs: [
      { id: 1, action: "Fairness Check Passed", detail: "TechCorp Drive #2024 diverse candidate pool confirmed", time: "2h ago" },
      { id: 2, action: "Skill Gap Alert", detail: "High demand for 'Kubernetes' detected, low supply", time: "5h ago" },
      { id: 3, action: "System Audit", detail: "Quarterly compliance report generated", time: "1d ago" }
    ]
  },
  companyDashboard: {
    kpis: [
      { label: "Active Campus Drives", value: "04", icon: Rocket, trend: "+1 new" },
      { label: "Total Applicants", value: "1,248", icon: Users, trend: "+12%" },
      { label: "Shortlisted", value: "312", icon: UserCheck, trend: "25% rate" },
      { label: "Interview Ready", value: "145", icon: Target, trend: "46% of short" },
      { label: "Conversion Rate", value: "8.2%", icon: TrendingUp, trend: "+1.2% yr" },
      { label: "Avg Readiness", value: "78%", icon: Award, trend: "High Talent" }
    ],
    funnel: [
      { name: 'Applied', value: 1248 },
      { name: 'Eligible', value: 950 },
      { name: 'Shortlisted', value: 312 },
      { name: 'Interviewed', value: 145 },
      { name: 'Selected', value: 102 }
    ],
    drives: [
      { id: 1, title: "Summer Internship Drive '25", role: "Internship", status: "Active", applicants: 450, branch: "CS/IT", cgpa: "8.5+", year: "3rd Year", timeline: "Jan 15 - Mar 10" },
      { id: 2, title: "Graduate Hire Program", role: "Full-Time", status: "Paused", applicants: 210, branch: "CS/EE", cgpa: "8.0+", year: "Final Year", timeline: "Feb 01 - Apr 20" },
      { id: 3, title: "SDE-1 Recruitment", role: "Full-Time", status: "Archive", applicants: 588, branch: "All Engineering", cgpa: "7.5+", year: "Final Year", timeline: "Dec 01 - Jan 10" }
    ],
    candidates: [
      { id: 1, name: "Rahul Deshmukh", college: "Metropolitan Tech", cgpa: 9.2, readiness: 88, match: 94, confidence: 91, branch: "Computer Science", year: "3rd", status: "Interviewed", consistency: "High", notes: "Solid DSA, great attitude." },
      { id: 2, name: "Sneha Nair", college: "Southern Tech", cgpa: 8.8, readiness: 72, match: 81, confidence: 78, branch: "IT", year: "3rd", status: "Shortlisted", consistency: "Medium", notes: "Lacks experience in React but strong fundamentals." },
      { id: 3, name: "Ananya Kapoor", college: "Science & Tech Univ", cgpa: 9.5, readiness: 95, match: 98, confidence: 96, branch: "Computer Science", year: "4th", status: "Selected", consistency: "Very High", notes: "Top of the class. Perfect match." },
      { id: 4, name: "Varun Gupta", college: "State Engineering", cgpa: 8.1, readiness: 61, match: 65, confidence: 70, branch: "Electronics", year: "3rd", status: "Applied", consistency: "Low", notes: "Eligible but score is average." }
    ],
    questions: [
      { id: 1, title: "Memory Management in React", category: "Coding", difficulty: "Hard", drives: ["Drive #1"], visibility: "Visible" },
      { id: 2, title: "Database Normalization Case Study", category: "Fundamentals", difficulty: "Medium", drives: ["All Drives"], visibility: "Hidden" },
      { id: 3, title: "Describe a Conflict resolution", category: "Behavioral", difficulty: "Easy", drives: ["Graduate Hire"], visibility: "Visible" }
    ]
  },
  notifications: {
    student: [
      { id: 1, title: "New Internship Posted", message: "Global Tech posted 'Backend Intern'. 91% Match!", time: "2m ago", type: "alert" },
      { id: 2, title: "Application Update", message: "You have been shortlisted by TechCorp!", time: "1h ago", type: "success" },
      { id: 3, title: "Deadline Approaching", message: "TechCorp Drive closes in 24 hours.", time: "5h ago", type: "warning" }
    ],
    employer: [
      { id: 1, title: "New Applicants", message: "15 new students applied to 'Summer Drive'.", time: "10m ago", type: "info" },
      { id: 2, title: "Drive Approved", message: "Admin approved your 'Graduate Hire' drive.", time: "2h ago", type: "success" },
      { id: 3, title: "Student Progress", message: "Arjun K. completed 'System Design' module.", time: "30m ago", type: "info" },
      { id: 4, title: "Mentorship Request", message: "Priya S. requested a review of her Resume.", time: "1d ago", type: "warning" }
    ],
    admin: [
      { id: 1, title: "New Drive Request", message: "FinTech Global requested approval for Campus Drive.", time: "5m ago", type: "alert" },
      { id: 2, title: "Flagged Content", message: "Community post flagged for moderation.", time: "4h ago", type: "warning" }
    ]
  }
};

// --- UI ATOMS ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, type = "button" }) => {
  const base = "px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20",
    outline: "border border-[#2a3347] text-blue-400 hover:bg-blue-900/20 hover:border-blue-500",
    ghost: "text-slate-300 hover:bg-[#1e2636]",
    white: "bg-[#1e2636] text-blue-400 hover:bg-[#2a3347]",
    danger: "bg-red-600 text-white hover:bg-red-500",
    black: "bg-[#0d1117] text-white hover:bg-[#161b27] border border-[#2a3347]",
    success: "bg-emerald-600 text-white hover:bg-emerald-500"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-[#161b27] rounded-xl border border-[#2a3347] shadow-lg overflow-hidden ${className}`}>{children}</div>
);

const Badge = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    gray: "bg-gray-50 text-gray-700 border-gray-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

const MatchScoreRing = ({ score, size = 160 }) => {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#E5E7EB" strokeWidth="10" fill="transparent" />
        <motion.circle 
          cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="10" fill="transparent" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-black leading-none" style={{ color }}>{score}%</span>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Score</p>
      </div>
    </div>
  );
};

// --- NOTIFICATION COMPONENT ---
const NotificationPanel = ({ role, onClose }) => {
  const notifications = INITIAL_DATA.notifications[role] || [];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-16 left-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[150] overflow-hidden"
    >
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold"><Bell className="w-4 h-4"/> Notifications</div>
        <button onClick={onClose}><X className="w-4 h-4 text-slate-400 hover:text-white"/></button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
           <div className="p-8 text-center text-slate-400 text-xs">No new notifications</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="p-4 border-b hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-slate-800">{n.title}</p>
                <span className="text-[9px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
            </div>
          ))
        )}
      </div>
      <div className="p-2 bg-slate-50 border-t text-center">
        <button className="text-[10px] font-black uppercase text-blue-600 hover:underline">Mark all read</button>
      </div>
    </motion.div>
  );
};

// --- SHARED COMPONENTS ---

const AIAssistant = ({ user, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, type: 'bot', text: `Hi ${user?.name || 'there'}! I'm your InternMatch AI. How can I help with your career today? ✨` }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const currentInput = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: currentInput }]);
    setIsTyping(true);
    
    try {
      const response = await callGemini(
        currentInput, 
        `You are the InternMatch AI Expert for a user with role: ${userRole}. User name: ${user?.name}. 
         For students: Focus on interview prep, resume tips, and job fit. 
         For companies: Focus on candidate analytics, hiring funnels, and JD optimization.
         For faculty: Focus on student progress, research opportunities, and academic mentorship.
         For admins: Focus on governance, fairness checks, and system health.
         Keep answers concise, professional, and encouraging. Use emojis.`
      );
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: response }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "Error connecting to AI. Please try again later." }]);
    } finally { 
      setIsTyping(false); 
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mb-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border flex flex-col h-[500px] overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2 font-bold"><Bot /> InternMatch AI ✨</div>
              <button onClick={() => setIsOpen(false)}><X /></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${m.type === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white shadow-sm border text-slate-700'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-gray-400 font-bold italic p-2 flex items-center gap-2"><Loader2 className="animate-spin w-3 h-3"/> AI is thinking...</div>}
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSend()} 
                placeholder="Ask for insights..." 
                className="flex-1 bg-slate-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100" 
              />
              <button onClick={handleSend} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 rounded-full bg-slate-900 text-white shadow-2xl flex items-center justify-center ring-4 ring-white hover:scale-105 transition-transform"><Sparkles className="w-7 h-7" /></button>
    </div>
  );
};

// --- PAGES & COMPONENTS ---

const LandingPage = ({ onNavigate, isDarkMode, setIsDarkMode }) => (
  <div className="min-h-screen overflow-hidden" style={{background:'#0d1117'}}>
    {/* Ambient orbs */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="orb orb-blue w-[600px] h-[600px] top-[-200px] right-[-100px]" />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-[-100px] left-[-100px]" style={{animationDelay:'3s'}} />
      <div className="orb orb-pink w-[300px] h-[300px] top-[40%] left-[30%]" style={{animationDelay:'6s'}} />
      <div className="bg-grid absolute inset-0" />
    </div>

    <nav className="relative z-50 sticky top-0" style={{background:'rgba(13,17,23,0.85)', backdropFilter:'blur(16px)', borderBottom:'1px solid #2a3347'}}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg glow-blue">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tighter gradient-text">INTERNMATCH AI</span>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full transition-colors" style={{background:'#1e2636',border:'1px solid #2a3347'}}>
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
          <Button variant="ghost" className="font-bold hidden sm:block" onClick={() => onNavigate('/login')}>Sign In</Button>
          <Button className="font-bold" onClick={() => onNavigate('/login')}>Get Started</Button>
        </div>
      </div>
    </nav>

    <header className="relative z-10 py-20 lg:py-32">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest" style={{background:'rgba(79,143,247,0.1)', border:'1px solid rgba(79,143,247,0.3)', color:'#60a5fa'}}>
            <Sparkles className="w-4 h-4" /> The Future of Hiring
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight" style={{color:'#e6edf3'}}>
            Match with your{' '}
            <span className="gradient-text">dream career.</span>
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed max-w-xl font-medium" style={{color:'#7d8fa3'}}>
            Advanced AI matching for students. Streamlined recruitment for companies. Simplified management for faculty. One unified platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={() => onNavigate('/login')} className="px-8 py-4 text-sm font-black h-auto">
              Start Your Journey <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
            <Button variant="outline" onClick={() => onNavigate('/login')} className="px-8 py-4 text-sm font-black h-auto">
              View Demo
            </Button>
          </div>
          <div className="pt-6 flex items-center gap-6 text-sm font-bold" style={{color:'#4a5568'}}>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Free for students</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> AI-Powered</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative lg:h-[560px] flex items-center justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-[2rem] blur-2xl opacity-20 scale-105" />
            <div className="relative rounded-[2rem] p-8 space-y-6 z-20" style={{background:'rgba(22,27,39,0.9)', backdropFilter:'blur(20px)', border:'1px solid #2a3347'}}>
              <div className="flex justify-between items-center pb-4" style={{borderBottom:'1px solid #2a3347'}}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(79,143,247,0.15)'}}>
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-black" style={{color:'#e6edf3'}}>AI Match Score</h4>
                    <p className="text-[10px] font-bold uppercase" style={{color:'#4a5568'}}>System Design Role</p>
                  </div>
                </div>
                <Badge color="green">Top Candidate</Badge>
              </div>
              <div className="flex justify-center py-4">
                <MatchScoreRing score={98} size={160} />
              </div>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 rounded-xl flex items-center px-4 gap-3" style={{background:'#0d1117', border:'1px solid #2a3347'}}>
                    <div className="w-8 h-8 rounded-full" style={{background:'#1e2636'}} />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 rounded w-1/2" style={{background:'#1e2636'}} />
                      <div className="h-2 rounded w-1/4" style={{background:'#161b27'}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div animate={{ y:[0,-10,0] }} transition={{ repeat:Infinity, duration:4 }} className="absolute -left-12 top-24 z-30 hidden sm:block">
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{background:'#161b27', border:'1px solid #2a3347'}}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'rgba(16,185,129,0.15)'}}><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="font-black text-sm" style={{color:'#e6edf3'}}>Skill Verified</p>
                  <p className="text-xs" style={{color:'#4a5568'}}>React & Node.js</p>
                </div>
              </div>
            </motion.div>

            <motion.div animate={{ y:[0,10,0] }} transition={{ repeat:Infinity, duration:5, delay:1 }} className="absolute -right-8 bottom-24 z-30 hidden sm:block">
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{background:'#161b27', border:'1px solid #2a3347'}}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background:'rgba(139,92,246,0.15)'}}><TrendingUp className="w-5 h-5 text-violet-400" /></div>
                <div>
                  <p className="font-black text-sm" style={{color:'#e6edf3'}}>Interview Ready</p>
                  <p className="text-xs" style={{color:'#4a5568'}}>+15% Probability</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </header>
  </div>
);

const LoginPage = ({ onLogin, onNavigate }) => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      onLogin({
        id: role === 'student' ? 1 : role === 'employer' ? 2 : 4,
        name: role === 'student' ? 'Shrenika Kumar' : role === 'employer' ? 'Employer & Academic' : 'Admin User',
        role,
        email: `${role}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
      });
      setGoogleLoading(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(() => {
      if (isForgotPassword) {
        setResetSent(true);
        setLoading(false);
      } else {
        const demoCreds = DEMO_CREDENTIALS[role];
        if (email === demoCreds.email && password === demoCreds.password) {
          onLogin({
            id: role === 'student' ? 1 : role === 'employer' ? 2 : 4,
            name: role === 'student' ? 'Shrenika Kumar' : role === 'employer' ? 'Employer & Academic' : 'Admin User',
            role: role,
            email: email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
          });
        } else {
          setError('Invalid email or password. Hint: Try the demo credentials below.');
        }
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden" style={{background:'#0d1117'}}>
      {/* Orbs */}
      <div className="orb orb-blue w-96 h-96 top-[-10%] left-[-10%]" />
      <div className="orb orb-purple w-96 h-96 bottom-[-20%] right-[-10%]" style={{animationDelay:'2s'}} />
      <div className="bg-grid absolute inset-0" />

      <div className="max-w-md w-full relative z-10 rounded-3xl p-8 sm:p-10" style={{background:'rgba(22,27,39,0.9)', backdropFilter:'blur(20px)', border:'1px solid #2a3347', boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}}>
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg glow-blue">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2" style={{color:'#e6edf3'}}>Welcome Back</h2>
          <p className="text-sm font-medium" style={{color:'#4a5568'}}>Sign in to your account</p>
        </div>

        {!isForgotPassword && (
          <>
            <div className="flex p-1 rounded-xl mb-6" style={{background:'#0d1117', border:'1px solid #2a3347'}}>
              {['student', 'employer', 'admin'].map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className="flex-1 py-2 text-[10px] sm:text-xs font-black uppercase rounded-lg transition-all"
                  style={role === r ? {background:'#1e2636', color:'#60a5fa', border:'1px solid #2a3347'} : {color:'#4a5568'}}
                >
                  {r === 'employer' ? 'Employer & Academic' : r}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full py-3.5 mb-6 font-bold flex items-center justify-center gap-3 rounded-xl transition-all disabled:opacity-50"
              style={{background:'#1e2636', border:'1px solid #2a3347', color:'#e6edf3'}}
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1" style={{background:'#2a3347'}} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#4a5568'}}>or continue with email</span>
              <div className="h-px flex-1" style={{background:'#2a3347'}} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-3 rounded-xl text-xs font-medium flex items-center gap-2" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171'}}><AlertCircle className="w-4 h-4" /> {error}</div>}
          {resetSent && <div className="p-3 rounded-xl text-xs font-medium flex items-center gap-2" style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#34d399'}}><CheckCircle className="w-4 h-4" /> Password reset link sent to your email!</div>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'#4a5568'}}>Email</label>
            <input
              type="email" required placeholder={!isForgotPassword ? DEMO_CREDENTIALS[role].email : "you@example.com"}
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{background:'#0d1117', border:'1px solid #2a3347', color:'#e6edf3'}}
              onFocus={e => e.target.style.borderColor='#4f8ff7'}
              onBlur={e => e.target.style.borderColor='#2a3347'}
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider" style={{color:'#4a5568'}}>Password</label>
                <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setResetSent(false); }} className="text-xs font-bold transition-colors" style={{color:'#4f8ff7'}}>Forgot Password?</button>
              </div>
              <input
                type="password" required placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{background:'#0d1117', border:'1px solid #2a3347', color:'#e6edf3'}}
                onFocus={e => e.target.style.borderColor='#4f8ff7'}
                onBlur={e => e.target.style.borderColor='#2a3347'}
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
          )}

          <Button type="submit" disabled={loading || googleLoading} className="w-full py-4 uppercase text-xs tracking-widest font-black mt-4 rounded-xl transition-all hover:scale-[1.02]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isForgotPassword ? 'Send Reset Link' : `Login as ${role}`}
          </Button>

          {isForgotPassword && (
            <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setResetSent(false); }} className="w-full text-center text-xs font-bold mt-4 transition-colors" style={{color:'#4a5568'}}>
              ← Back to Login
            </button>
          )}
        </form>

        {!isForgotPassword && (
          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 pb-2" style={{color:'#2a3347', borderBottom:'1px solid #2a3347'}}>Demo Credentials</p>
            <div className="text-xs space-y-1" style={{color:'#4a5568'}}>
              <p>Email: <span className="font-mono" style={{color:'#4f8ff7'}}>{DEMO_CREDENTIALS[role].email}</span></p>
              <p>Password: <span className="font-mono" style={{color:'#4f8ff7'}}>{DEMO_CREDENTIALS[role].password}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CommunityHub = ({ posts, addPost }) => {
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community Mentorship</h1>
          <p className="text-slate-500 font-medium">Connect with Alumni, Mentors & Faculty.</p>
        </div>
        <Button onClick={() => document.getElementById('new-post').scrollIntoView({ behavior: 'smooth' })}><MessageSquare className="w-4 h-4"/> Start Discussion</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Interview Experiences', 'Research', 'Career Guidance'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border text-slate-500 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {posts.map(post => (
            <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${post.role === 'Faculty' ? 'bg-purple-600' : post.role === 'Admin' ? 'bg-slate-900' : 'bg-blue-500'}`}>
                    {post.author[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{post.author}</h4>
                    <Badge color={post.role === 'Faculty' ? 'purple' : post.role === 'Admin' ? 'black' : 'blue'} className="text-[9px]">{post.role}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {post.tags?.map(t => <Badge key={t} color="gray" className="text-[9px]">{t}</Badge>)}
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">{post.title}</h3>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">{post.content}</p>
              <div className="flex gap-6 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><ThumbsUp className="w-4 h-4"/> {post.likes}</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><MessageCircle className="w-4 h-4"/> {post.comments} Comments</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600"><Share2 className="w-4 h-4"/> Share</span>
              </div>
            </Card>
          ))}
          
          <Card id="new-post" className="p-6 bg-slate-50 border-dashed border-2 border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Start a new discussion</h3>
            <input 
              className="w-full p-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100" 
              placeholder="Topic Title..."
              value={newPost.title}
              onChange={e => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea 
              className="w-full p-3 rounded-xl border mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]" 
              placeholder="What's on your mind? Ask about interviews, research, or career tips..."
              value={newPost.content}
              onChange={e => setNewPost({...newPost, content: e.target.value})}
            />
            <div className="flex justify-end">
              <Button onClick={() => {
                if(newPost.title && newPost.content) {
                  addPost({
                    id: Date.now(),
                    author: "You",
                    role: "User",
                    title: newPost.title,
                    content: newPost.content,
                    likes: 0,
                    comments: 0,
                    tags: ["Discussion"]
                  });
                  setNewPost({title: '', content: ''});
                }
              }}>Post to Community</Button>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
            <h3 className="font-black text-lg mb-2">Faculty Mentors</h3>
            <p className="text-sm text-purple-100 mb-4">Professors are active in the "Research" tab. Connect for academic guidance.</p>
            <div className="flex -space-x-2 mb-4">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-purple-500" />)}
            </div>
            <Button variant="white" className="w-full text-xs">View Mentors</Button>
          </Card>
          
           <Card className="p-6">
            <h3 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest">Trending Topics</h3>
            <div className="space-y-3">
              {['#SystemDesign', '#OffCampus', '#ResearchInternships', '#ResumeReview'].map(t => (
                <div key={t} className="flex justify-between items-center text-sm font-bold text-slate-600 hover:text-blue-600 cursor-pointer">
                  <span>{t}</span>
                  <span className="text-slate-300 text-xs">24 posts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- TEAM FORMATION COMPONENT (NEW) ---
const TeamFormation = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('find-teams');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', focus: '', roles: '' });
  const data = INITIAL_DATA.teamFormation;

  const handleCreateTeam = (e) => {
    e.preventDefault();
    setShowCreateModal(false);
    alert(`Team "${newTeam.name}" created successfully! Check "My Team" tab.`);
    // In a real app, this would update state/DB
    setActiveTab('my-team');
  };

  const handleAction = (action, item) => {
    alert(`${action} for ${item} sent!`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Formation</h1>
          <p className="text-slate-500 font-medium">Connect with peers for Hackathons, Projects & Internships.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4"/> Create Team</Button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {['find-teams', 'find-teammates', 'my-team'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'find-teams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.availableTeams.map(team => (
            <Card key={team.id} className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-all group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Badge color="purple" className="mb-2">{team.focus}</Badge>
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600"><Sparkles className="w-3 h-3"/> {team.matchScore}% Match</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{team.name}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{team.description}</p>
                
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Current Squad</p>
                  <div className="flex items-center gap-2">
                    {team.members.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">{m.avatar}</div>
                        <span className="text-xs font-bold text-slate-700">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Looking For</p>
                  <div className="flex flex-wrap gap-2">
                    {team.lookingFor.map(role => (
                      <Badge key={role} color="amber" className="bg-amber-50 text-amber-700 border-amber-200">
                        {role === 'Designer' ? <PenTool className="w-3 h-3 mr-1"/> : <Code className="w-3 h-3 mr-1"/>}
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t mt-4 flex items-center justify-between">
                 <p className="text-xs text-slate-400 italic">"{team.matchReason}"</p>
                 <Button className="text-xs" onClick={() => handleAction("Request to Join", team.name)}>Request to Join</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'find-teammates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.suggestedTeammates.map(user => (
            <Card key={user.id} className="p-6 text-center hover:border-blue-300 transition-colors">
              <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-400 mb-4 border-4 border-white shadow-lg">
                {user.avatar}
              </div>
              <h3 className="text-lg font-black text-slate-800">{user.name}</h3>
              <p className="text-sm font-bold text-blue-600 mb-4">{user.role}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {user.skills.map(skill => <Badge key={skill} color="gray">{skill}</Badge>)}
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3 mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Compatibility</span>
                  <span className="text-green-600">{user.compatibility}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[98%]"></div>
                </div>
              </div>

              <Button variant="outline" className="w-full text-xs" onClick={() => handleAction("Invite", user.name)}><UserPlus className="w-3 h-3"/> Invite to Team</Button>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'my-team' && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-slate-300">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">You haven't joined a team yet</h3>
          <p className="text-slate-500 max-w-md mb-8">Create your own team and invite peers, or browse existing teams looking for your skills.</p>
          <div className="flex gap-4">
             <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4"/> Create New Team</Button>
             <Button variant="outline" onClick={() => onNavigate('/student/interview-prep')}>Upskill in Prep Hub</Button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 space-y-4 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Create New Team</h2>
              <button onClick={() => setShowCreateModal(false)}><X /></button>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Team Name</label>
                <input required className="w-full p-3 border rounded-xl mt-1" placeholder="e.g. Code Warriors" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Project / Hackathon Focus</label>
                <input required className="w-full p-3 border rounded-xl mt-1" placeholder="e.g. Smart India Hackathon" value={newTeam.focus} onChange={e => setNewTeam({...newTeam, focus: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Looking for Roles (comma sep)</label>
                <input required className="w-full p-3 border rounded-xl mt-1" placeholder="Frontend, Designer..." value={newTeam.roles} onChange={e => setNewTeam({...newTeam, roles: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Create & Open for Invites</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const StudentDashboard = ({ onNavigate, opportunities }) => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Good Morning, Shrenika! 🚀</h1>
        <p className="text-slate-500 font-medium">You have 3 high-probability matches today.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => onNavigate('/student/explore')}>Explore Roles</Button>
        <Button onClick={() => onNavigate('/student/interview-prep')}>Prep Hub</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 bg-blue-600 text-white relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('/student/opportunity', 3)}>
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-transparent mb-4">AI TOP PICK</Badge>
          <h3 className="text-2xl font-black mb-1">Global Tech</h3>
          <p className="text-blue-100 text-sm mb-6">Backend Intern • 91% Match</p>
          <Button variant="white" className="w-full text-xs font-bold">View Offer</Button>
        </div>
        <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
      </Card>

      <Card className="p-6 flex flex-col justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interview Readiness</p>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-4xl font-black text-slate-800">65%</span>
            <span className="text-xs font-bold text-green-500 mb-1">+5% vs last week</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full">
            <div className="h-full bg-blue-600 rounded-full w-[65%]" />
          </div>
        </div>
      </Card>

      <Card className="p-6 flex flex-col justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Applications</p>
        <div className="flex items-center gap-4">
          <span className="text-6xl font-black text-slate-800">01</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-600">TechCorp</p>
            <p className="text-xs text-slate-400">Status: Shortlisted</p>
          </div>
          <ChevronRight className="text-slate-200" />
        </div>
      </Card>
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">Latest Opportunities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {opportunities.slice(0, 3).map(opp => (
            <Card key={opp.id} className="p-6 hover:shadow-lg transition-all border-none group cursor-pointer" onClick={() => onNavigate('/student/opportunity', opp.id)}>
              <div className="flex justify-between items-start mb-6">
                <img src={opp.logo} className="w-12 h-12 rounded-xl border shadow-sm group-hover:scale-105 transition-transform" alt="" />
                <Badge color={opp.type === 'Research' || opp.source === 'faculty' ? 'purple' : 'green'}>{opp.matchScore}% Match</Badge>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">{opp.role}</h3>
              <p className="text-sm font-bold text-blue-600 mb-2">{opp.company}</p>
              {(opp.type === 'Research' || opp.source === 'faculty') && <Badge color="purple" className="mb-4">Academic Posted</Badge>}
              <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400 mt-2">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {opp.type}</span>
              </div>
            </Card>
         ))}
      </div>
    </div>
  </div>
);

const InterviewPrepHub = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Interview Prep Hub</h1>
        <p className="text-slate-500 font-medium">Resources tailored to your target roles.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-8 border-none bg-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-[10px] mb-4"><Zap className="w-4 h-4" /> AI Mock Interviewer</div>
            <h3 className="text-2xl font-black mb-4">Practice with Realistic Questions</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">Our AI simulates TechCorp's Technical Round 1 with feedback on your logic and code structure.</p>
            <Button variant="white" className="px-8">Start Session</Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800">Company Insights</h3>
          {INITIAL_DATA.prepHub.companies.map(c => (
            <Card key={c.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={c.logo} className="w-12 h-12 rounded-xl object-cover" alt="" />
                  <div>
                    <h4 className="font-black text-slate-800">{c.name}</h4>
                    <p className="text-xs text-slate-400">{c.rounds.length} Interview Rounds</p>
                  </div>
                </div>
                <Badge color="blue">{c.difficulty} Difficulty</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.mostAsked.map(topic => <Badge key={topic} color="gray" className="bg-slate-50 border-slate-100">{topic}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ApplicationsPage = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Applications</h1>
    {INITIAL_DATA.applications.map(app => (
      <Card key={app.id} className="overflow-hidden border-none shadow-md">
        <div className="p-8 flex flex-col md:flex-row gap-8 items-center bg-white border-b">
          <img src={app.logo} className="w-16 h-16 rounded-2xl border shadow-sm" alt="" />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-800 mb-1">{app.role}</h3>
            <p className="font-bold text-blue-600 mb-2">{app.company} • {app.location}</p>
            <div className="flex justify-center md:justify-start gap-4 text-[10px] font-black uppercase text-slate-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Applied {app.appliedDate}</span>
              <span className="flex items-center gap-1 text-blue-500"><Zap className="w-3 h-3"/> {app.matchScore}% Match</span>
            </div>
          </div>
          <div className="text-center">
            <Badge color="green" className="text-sm px-4 py-1.5 uppercase">{app.status}</Badge>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Current Status</p>
          </div>
        </div>
        <div className="p-8 bg-slate-50/50 overflow-x-auto no-scrollbar">
          <div className="flex justify-between min-w-[600px] relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0" />
            {app.timeline.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step.status === 'done' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{step.event}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const ProfilePage = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <Card className="border-none shadow-xl overflow-visible mt-12">
      <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
      <div className="px-8 pb-8">
        <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 mb-8">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg bg-white" alt="" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900">Shrenika Kumar</h1>
              <Badge color="blue" className="px-3"><ShieldCheck className="w-3 h-3" /> VERIFIED</Badge>
            </div>
            <p className="font-bold text-slate-500">Final Year CS Student • Institute of Tech</p>
          </div>
          <Button variant="outline"><Edit2 className="w-4 h-4" /> Edit Profile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800">Skills & Mastery</h3>
            <div className="space-y-4">
              {[{ name: 'React', score: 85 }, { name: 'Node.js', score: 72 }, { name: 'Python', score: 90 }].map(skill => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                    <span>{skill.name}</span>
                    <span>{skill.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${skill.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800">Verification Badges</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Code Mastery', 'Top Recruiter', 'Verified ID'].map(b => (
                <div key={b} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center text-center gap-2 group hover:bg-blue-600 transition-colors">
                  <Award className="w-8 h-8 text-blue-600 group-hover:text-white" />
                  <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-blue-100">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// --- FACULTY COMPONENTS ---

const EmployerDashboard = ({ onNavigate, opportunities, addOpportunity }) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [newOpp, setNewOpp] = useState({ role: '', type: 'Corporate Job', description: '', skills: '' });
  const data = INITIAL_DATA.companyDashboard;

  const handlePost = (e) => {
    e.preventDefault();
    addOpportunity({
      id: Date.now(),
      company: "Employer Portal",
      role: newOpp.role,
      logo: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop",
      salary: { min: 20, max: 50 },
      location: "Hybrid",
      type: newOpp.type,
      apps: 0,
      matchScore: 99,
      rating: 5.0,
      description: newOpp.description,
      skillsRequired: newOpp.skills.split(',').map(s => s.trim()),
      yourSkills: [],
      duration: "Flexible",
      reviews: 0,
      source: 'employer'
    });
    setShowPostModal(false);
    setNewOpp({ role: '', type: 'Corporate Job', description: '', skills: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Employer Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage corporate hiring, campus drives & academic research.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowPostModal(true)}><Plus className="w-4 h-4"/> Post Opportunity</Button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
           { label: "Active Opportunities", value: "09", icon: Rocket, color: "blue" },
           { label: "Total Applicants", value: "1,248", icon: Users, color: "purple" },
           { label: "Interview Ready", value: "145", icon: Target, color: "amber" },
           { label: "Conversion Rate", value: "8.2%", icon: TrendingUp, color: "green" },
         ].map((stat, i) => (
           <Card key={i} className="p-5">
             <div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center bg-${stat.color}-100 text-${stat.color}-600`}>
                <stat.icon className="w-4 h-4" />
             </div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
             <p className="text-2xl font-black text-slate-800">{stat.value}</p>
           </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-tight">Hiring Pipeline Flow</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-8">
           <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Talent Progress</h3>
           <div className="space-y-4">
             {[
               {name: 'Arjun K.', score: 92, status: 'Ready'},
               {name: 'Priya S.', score: 78, status: 'Prep'},
               {name: 'Rohan M.', score: 65, status: 'Needs Help'},
             ].map((s, i) => (
               <div key={i} className="flex justify-between items-center pb-3 border-b last:border-0">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{s.name[0]}</div>
                   <span className="font-bold text-slate-700">{s.name}</span>
                 </div>
                 <div className="text-right">
                    <span className={`text-xs font-bold ${s.score > 80 ? 'text-green-600' : s.score > 70 ? 'text-amber-500' : 'text-red-500'}`}>{s.score}% Readiness</span>
                 </div>
               </div>
             ))}
           </div>
           <Button variant="ghost" className="w-full mt-4 text-xs" onClick={() => onNavigate('/employer/pipeline')}>View All Talent</Button>
        </Card>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 space-y-4 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Post Opportunity</h2>
              <button onClick={() => setShowPostModal(false)}><X /></button>
            </div>
            <form onSubmit={handlePost} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Role Title</label>
                <input required className="w-full p-3 border rounded-xl mt-1" placeholder="e.g. Frontend Intern or ML Researcher" value={newOpp.role} onChange={e => setNewOpp({...newOpp, role: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                   <select className="w-full p-3 border rounded-xl mt-1" value={newOpp.type} onChange={e => setNewOpp({...newOpp, type: e.target.value})}>
                     <option>Corporate Job</option>
                     <option>Internship</option>
                     <option>Research Role</option>
                   </select>
                </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Skills (comma sep)</label>
                   <input required className="w-full p-3 border rounded-xl mt-1" placeholder="React, Python..." value={newOpp.skills} onChange={e => setNewOpp({...newOpp, skills: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea required className="w-full p-3 border rounded-xl mt-1" rows="3" placeholder="Describe the work..." value={newOpp.description} onChange={e => setNewOpp({...newOpp, description: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Publish Opportunity</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const ExplorePage = ({ onNavigate, opportunities }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-end">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Roles</h1>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map(opp => (
        <Card key={opp.id} className="p-6 hover:shadow-lg transition-all border-none group cursor-pointer" onClick={() => onNavigate('/student/opportunity', opp.id)}>
          <div className="flex justify-between items-start mb-6">
            <img src={opp.logo} className="w-12 h-12 rounded-xl border shadow-sm group-hover:scale-105 transition-transform" alt="" />
            <Badge color={opp.type === 'Research' || opp.source === 'faculty' ? 'purple' : 'green'}>{opp.matchScore}% Match</Badge>
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-1">{opp.role}</h3>
          <p className="text-sm font-bold text-blue-600 mb-4">{opp.company}</p>
          {(opp.type === 'Research' || opp.source === 'faculty') && <Badge color="purple" className="mb-4">Academic Posted</Badge>}
          <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400 mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {opp.type}</span>
          </div>
          <Button className="w-full text-xs" onClick={(e) => { e.stopPropagation(); onNavigate('/student/opportunity', opp.id); }}>View Role</Button>
        </Card>
      ))}
    </div>
  </div>
);

const OpportunityDetail = ({ activeOpp, onNavigate, user }) => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
    <button onClick={() => onNavigate('/student/explore')} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-blue-600">
      <ArrowLeft className="w-4 h-4" /> Back to Search
    </button>
    <Card className="border-none shadow-xl">
      <div className="p-10 border-b flex flex-col md:flex-row items-center gap-8">
        <img src={activeOpp.logo} className="w-24 h-24 rounded-3xl border shadow-lg" alt="" />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-2">{activeOpp.role}</h1>
          <p className="text-xl font-bold text-blue-600 mb-4">{activeOpp.company} • {activeOpp.location}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Badge color="blue">{activeOpp.type}</Badge>
            <Badge color="green">₹{activeOpp.salary?.min}-{activeOpp.salary?.max}k/mo</Badge>
            {(activeOpp.source === 'faculty' || activeOpp.type === 'Research') && <Badge color="purple">Academic</Badge>}
          </div>
        </div>
        <MatchScoreRing score={activeOpp.matchScore} size={120} />
      </div>
      <div className="p-10 space-y-10">
        <section className="space-y-4">
          <h3 className="text-xl font-black text-slate-800">Job Description</h3>
          <p className="text-slate-600 leading-relaxed text-lg">{activeOpp.description}</p>
        </section>
        <section className="grid md:grid-cols-2 gap-10 pt-10 border-t">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-800">Required Skills</h3>
            <div className="space-y-3">
              {activeOpp.skillsRequired.map(skill => (
                <div key={skill} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-700">{skill}</span>
                  {activeOpp.yourSkills.includes(skill) ? <CheckCircle className="text-green-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Card className="p-6 bg-slate-900 text-white border-none">
              <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase mb-4"><Sparkles className="w-4 h-4" /> AI Strategy</div>
              <p className="text-slate-300 italic mb-6">"Tailor your application by highlighting your '{activeOpp.yourSkills[0]}' projects. This increases your probability score by 12%."</p>
              <Button variant="white" className="w-full">Apply Now</Button>
            </Card>
          </div>
        </section>
      </div>
    </Card>
  </div>
);

const CampusDrives = () => (
  <div className="space-y-8 animate-in fade-in">
    <div className="flex justify-between items-end">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Drives</h1>
      <Button><Plus className="w-4 h-4" /> Start Drive</Button>
    </div>
    <div className="grid grid-cols-1 gap-4">
      {INITIAL_DATA.companyDashboard.drives.map(drive => (
        <Card key={drive.id} className="p-6 flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-black text-slate-800">{drive.title}</h3>
              <Badge color={drive.status === 'Active' ? 'green' : 'gray'}>{drive.status}</Badge>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{drive.role} • {drive.branch} • CGPA {drive.cgpa}</p>
          </div>
          <div className="text-center px-8 border-l border-slate-100">
            <p className="text-2xl font-black text-slate-800">{drive.applicants}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase">Applicants</p>
          </div>
          <Button variant="outline"><Edit2 className="w-4 h-4" /></Button>
        </Card>
      ))}
    </div>
  </div>
);

const TalentPipeline = () => (
  <div className="space-y-8 animate-in fade-in">
    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Talent Pool</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {INITIAL_DATA.companyDashboard.candidates.map(c => (
        <Card key={c.id} className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} className="w-12 h-12 rounded-xl border" alt="" />
              <div>
                <h4 className="text-xl font-black text-slate-800">{c.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase">{c.college}</p>
              </div>
            </div>
            <Badge color="blue">{c.status}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase">Readiness</p>
              <p className="text-lg font-black text-emerald-500">{c.readiness}%</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-[8px] font-black text-slate-400 uppercase">Skill Match</p>
              <p className="text-lg font-black text-blue-600">{c.match}%</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase">Confidence</p>
              <p className="text-lg font-black text-indigo-600">{c.confidence}%</p>
            </div>
          </div>
          <Button variant="outline" className="w-full text-xs font-black uppercase">Schedule Interview</Button>
        </Card>
      ))}
    </div>
  </div>
);

const CompanyQuestionBank = () => (
  <div className="space-y-8 animate-in fade-in">
    <div className="flex justify-between items-end">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Bank</h1>
      <Button><Plus className="w-4 h-4" /> New Question</Button>
    </div>
    <Card className="border-none shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {INITIAL_DATA.companyDashboard.questions.map(q => (
              <tr key={q.id}>
                <td className="px-6 py-5 font-black text-slate-800">{q.title}</td>
                <td className="px-6 py-5"><Badge color="blue">{q.category}</Badge></td>
                <td className="px-6 py-5"><Badge color="red">{q.difficulty}</Badge></td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-slate-300 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

// --- ADMIN DASHBOARD (ENHANCED) ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const data = INITIAL_DATA.adminStats;

  const [approvals, setApprovals] = useState(data.approvals);
  
  const handleApprovalAction = (id, newStatus) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {data.kpis.map((kpi, i) => (
                <Card key={i} className="p-6 border-none shadow-sm dark:bg-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
                    <kpi.icon className={`w-4 h-4 text-${kpi.color}-500`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{kpi.value}</span>
                    <span className={`text-[10px] font-bold text-${kpi.color}-500`}>{kpi.trend}</span>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 dark:bg-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Skill Gap vs Market Needs</h3>
                <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.skillsGap}>
                       <PolarGrid stroke="#cbd5e1" />
                       <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                       <Radar name="Student Supply" dataKey="supply" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                       <Radar name="Market Demand" dataKey="demand" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                       <Legend />
                       <RechartsTooltip />
                     </RadarChart>
                   </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-8 dark:bg-slate-800">
                 <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Platform Growth Trends</h3>
                 <div className="h-72">
                   <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={data.growth}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                       <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                       <RechartsTooltip />
                       <Legend />
                       <Area type="monotone" dataKey="users" fill="#818cf8" stroke="#4f46e5" fillOpacity={0.2} />
                       <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} />
                     </ComposedChart>
                   </ResponsiveContainer>
                 </div>
              </Card>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="p-8 flex flex-col items-center justify-center text-center dark:bg-slate-800">
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                    <Activity className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white mb-1">99.9%</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">System Uptime</p>
                  <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[45%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Current Load: 45%</p>
                </Card>
                
                <Card className="lg:col-span-2 p-8 dark:bg-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Compliance & Activity Log</h3>
                    <Button variant="outline" className="text-xs h-8">Export Report</Button>
                  </div>
                  <div className="space-y-4">
                    {data.logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="mt-1"><FileCheck className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{log.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{log.detail}</p>
                          <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
             </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6 animate-in fade-in">
            <Card className="border-none shadow-sm overflow-hidden dark:bg-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">User Directory</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Search users..." className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {[
                      { id: 1, name: 'Shrenika Kumar', email: 'student@example.com', role: 'Student', status: 'Active' },
                      { id: 2, name: 'Company & Faculty', email: 'employer@example.com', role: 'Employer', status: 'Active' },
                      { id: 3, name: 'John Doe', email: 'john@spam.com', role: 'Student', status: 'Suspended' },
                    ].map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700 dark:text-slate-200">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </td>
                        <td className="px-6 py-4"><Badge color="blue">{user.role}</Badge></td>
                        <td className="px-6 py-4"><Badge color={user.status === 'Active' ? 'green' : 'red'}>{user.status}</Badge></td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <Button variant="outline" className="h-8 px-3 text-xs">Edit</Button>
                          <Button variant="danger" className="h-8 px-3 text-xs">Suspend</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      case 'approvals':
        return (
          <div className="space-y-6 animate-in fade-in">
            <Card className="border-none shadow-sm overflow-hidden dark:bg-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Entity</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {approvals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4"><Badge color="gray">{item.type}</Badge></td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{item.entity}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{item.title}</td>
                      <td className="px-6 py-4">
                        <Badge color={item.status === 'Approved' ? 'green' : item.status === 'Rejected' ? 'red' : 'yellow'}>{item.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        {item.status === 'Pending' || item.status === 'Flagged' ? (
                          <>
                            <Button variant="success" onClick={() => handleApprovalAction(item.id, 'Approved')} className="h-8 px-3 text-xs">Approve</Button>
                            <Button variant="danger" onClick={() => handleApprovalAction(item.id, 'Rejected')} className="h-8 px-3 text-xs">Reject</Button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 uppercase">Actioned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Governance Center</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Platform oversight, approvals, and fairness monitoring.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {['overview', 'users', 'system', 'approvals'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

// --- MAIN APP FRAMEWORK ---

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('internmatch_theme') !== 'light');
  const [path, setPath] = useState('/');
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('internmatch_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('internmatch_theme', 'light');
    }
  }, [isDarkMode]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // App-level state for data modification
  const [opportunities, setOpportunities] = useState(INITIAL_DATA.opportunities);
  const [posts, setPosts] = useState(INITIAL_DATA.communityPosts);

  useEffect(() => {
    const saved = localStorage.getItem('internmatch_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('internmatch_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (u) => { 
    setUser(u); 
    localStorage.setItem('internmatch_user', JSON.stringify(u)); 
    setPath(u.role === 'admin' ? '/admin/dashboard' : u.role === 'employer' ? '/employer/dashboard' : '/student/dashboard'); 
  };
  
  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('internmatch_user'); 
    setPath('/'); 
  };
  
  const navigate = (p, id = null) => { 
    setPath(p); 
    if (id !== null) setSelectedId(id); 
    setSidebarOpen(false); 
    window.scrollTo(0,0); 
  };
  
  const addOpportunity = (opp) => {
    setOpportunities(prev => [opp, ...prev]);
  };

  const addPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

  const renderView = () => {
    if (path === '/') return <LandingPage onNavigate={navigate} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
    if (path === '/login') return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;
    
    if (user?.role === 'student') {
      switch(path) {
        case '/student/dashboard': return <StudentDashboard onNavigate={navigate} opportunities={opportunities} />;
        case '/student/explore': return <ExplorePage onNavigate={navigate} opportunities={opportunities} />;
        case '/student/interview-prep': return <InterviewPrepHub />;
        case '/student/community': return <CommunityHub posts={posts} addPost={addPost} />;
        case '/student/teams': return <TeamFormation onNavigate={navigate} />;
        case '/student/applications': return <ApplicationsPage />;
        case '/student/profile': return <ProfilePage />;
        case '/student/opportunity': return <OpportunityDetail user={user} activeOpp={opportunities.find(o => o.id === selectedId) || opportunities[0]} onNavigate={navigate} />;
        default: return <StudentDashboard onNavigate={navigate} opportunities={opportunities} />;
      }
    }
    
    if (user?.role === 'employer') {
      switch(path) {
        case '/employer/dashboard': return <EmployerDashboard onNavigate={navigate} opportunities={opportunities} addOpportunity={addOpportunity} />;
        case '/employer/drives': return <CampusDrives />;
        case '/employer/pipeline': return <TalentPipeline />;
        case '/employer/questions': return <CompanyQuestionBank />;
        case '/employer/community': return <CommunityHub posts={posts} addPost={addPost} />;
        default: return <EmployerDashboard onNavigate={navigate} opportunities={opportunities} addOpportunity={addOpportunity} />;
      }
    }
    
    if (user?.role === 'admin') return <AdminDashboard />;
    return <LandingPage onNavigate={navigate} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
  };

  const navItems = {
    student: [
      { icon: LayoutDashboard, label: 'Overview', path: '/student/dashboard' },
      { icon: Search, label: 'Explore Roles', path: '/student/explore' },
      { icon: GraduationCap, label: 'Prep Hub', path: '/student/interview-prep' },
      { icon: Users, label: 'Teams', path: '/student/teams' },
      { icon: MessageSquare, label: 'Community', path: '/student/community' },
      { icon: FileText, label: 'Applications', path: '/student/applications' },
      { icon: User, label: 'Identity', path: '/student/profile' },
    ],
    employer: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/employer/dashboard' },
      { icon: Rocket, label: 'Manage Opportunities', path: '/employer/drives' },
      { icon: UserCheck, label: 'Talent Pool', path: '/employer/pipeline' },
      { icon: ClipboardList, label: 'Question Bank', path: '/employer/questions' },
      { icon: MessageSquare, label: 'Community', path: '/employer/community' },
    ],
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Scale, label: 'Governance', path: '/admin/dashboard' },
      { icon: CheckSquare, label: 'Approvals', path: '/admin/dashboard' },
    ]
  };

  const currentNav = user ? (navItems[user.role] || []) : [];

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/20 antialiased transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`} style={{background: isDarkMode ? '#0d1117' : '#f8fafc', color: isDarkMode ? '#e6edf3' : '#0f172a'}}>
      {!user ? renderView() : (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className={`fixed lg:sticky top-0 h-full w-72 z-[100] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{background:'#161b27', borderRight:'1px solid #2a3347'}}>
            <div className="flex flex-col h-full">
              <div className="p-8" style={{borderBottom:'1px solid #2a3347'}}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><ShieldCheck className="w-5 h-5" /></div>
                  <span className="font-black text-xl tracking-tighter uppercase gradient-text">InternMatch</span>
                </div>
              </div>
              <nav className="flex-1 p-6 space-y-1 overflow-y-auto no-scrollbar">
                {currentNav.map((item, idx) => {
                  const Icon = item.icon;
                  const active = path === item.path;
                  return (
                    <button key={idx} onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                      style={active ? {background:'linear-gradient(135deg,#2563eb,#7c3aed)', color:'#fff', boxShadow:'0 4px 20px rgba(79,143,247,0.3)'} : {color:'#4a5568'}}
                      onMouseEnter={e => { if(!active) e.currentTarget.style.background='#1e2636'; e.currentTarget.style.color='#7d8fa3'; }}
                      onMouseLeave={e => { if(!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#4a5568'; } }}
                    >
                      <Icon className="w-5 h-5" /> {item.label}
                    </button>
                  );
                })}
              </nav>
              <div className="p-6 relative" style={{borderTop:'1px solid #2a3347', background:'#0d1117'}}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="absolute -top-3 right-6 p-2 rounded-full transition-colors"
                  style={{background:'#1e2636', border:'1px solid #2a3347'}}
                >
                  <Bell className="w-4 h-4" style={{color:'#7d8fa3'}} />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2" style={{borderColor:'#0d1117'}}></span>
                </button>
                <AnimatePresence>
                  {showNotifications && <NotificationPanel role={user.role} onClose={() => setShowNotifications(false)} />}
                </AnimatePresence>

                <div className="flex items-center justify-between gap-3 mb-4 px-1">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-8 h-8 rounded-full" style={{border:'1px solid #2a3347', background:'#1e2636'}} alt="" />
                    <div className="overflow-hidden text-left">
                      <p className="text-xs font-bold truncate" style={{color:'#e6edf3'}}>{user.name}</p>
                      <p className="text-[10px] truncate capitalize" style={{color:'#4a5568'}}>{user.role}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full transition-colors" style={{background:'#1e2636', border:'1px solid #2a3347'}}>
                    {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" style={{color:'#7d8fa3'}} />}
                  </button>
                </div>
                <Button variant="danger" className="w-full text-[10px] uppercase font-black py-3" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="h-16 lg:hidden flex items-center px-6 justify-between flex-shrink-0 z-[110]" style={{background:'#161b27', borderBottom:'1px solid #2a3347'}}>
              <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="w-6 h-6" style={{color:'#7d8fa3'}} /></button>
              <span className="font-black uppercase gradient-text">InternMatch</span>
              <div className="w-6" />
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full no-scrollbar">
               {renderView()}
            </main>
            
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
              <div className="fixed inset-0 bg-black/50 z-[90] lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
          </div>
        </div>
      )}
      <AIAssistant user={user} userRole={user?.role || 'guest'} />
    </div>
  );
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);