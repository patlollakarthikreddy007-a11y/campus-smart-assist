import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Users, 
  UtensilsCrossed, 
  BookOpen, 
  FileText,
  Clock,
  MapPin,
  Phone
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  category?: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  query: string;
  category: string;
}

const quickActions: QuickAction[] = [
  { label: "Class Schedule", icon: <Calendar className="w-4 h-4" />, query: "Show me my class schedule for today", category: "schedules" },
  { label: "Faculty Directory", icon: <Users className="w-4 h-4" />, query: "Find faculty information", category: "faculty" },
  { label: "Dining Hours", icon: <UtensilsCrossed className="w-4 h-4" />, query: "What are the dining hall hours?", category: "dining" },
  { label: "Library Services", icon: <BookOpen className="w-4 h-4" />, query: "Tell me about library services", category: "library" },
  { label: "Registration Help", icon: <FileText className="w-4 h-4" />, query: "How do I register for classes?", category: "admin" },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "schedules": return "quick-action-schedules";
    case "faculty": return "quick-action-faculty";
    case "dining": return "quick-action-dining";
    case "library": return "quick-action-library";
    case "admin": return "quick-action-admin";
    default: return "bg-campus-cyan/10 text-campus-cyan hover:bg-campus-cyan hover:text-white border-campus-cyan/30";
  }
};

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "schedules": return "bg-campus-purple/20 text-campus-purple border-campus-purple/30";
    case "faculty": return "bg-campus-pink/20 text-campus-pink border-campus-pink/30";
    case "dining": return "bg-campus-orange/20 text-campus-orange border-campus-orange/30";
    case "library": return "bg-campus-green/20 text-campus-green border-campus-green/30";
    case "admin": return "bg-campus-yellow/20 text-campus-yellow border-campus-yellow/30";
    default: return "bg-campus-cyan/20 text-campus-cyan border-campus-cyan/30";
  }
};

// Mock campus data
const campusData = {
  schedules: {
    "class schedule": "📅 **Today's Classes**\n\n• **9:00 AM - 10:30 AM**: Computer Science 101 (Room A-204)\n• **11:00 AM - 12:30 PM**: Mathematics 201 (Room B-105)\n• **2:00 PM - 3:30 PM**: Physics Lab (Lab C-301)\n• **4:00 PM - 5:30 PM**: English Literature (Room D-202)",
    "exam schedule": "📝 **Upcoming Exams**\n\n• **March 15**: Midterm - Computer Science 101\n• **March 18**: Quiz - Mathematics 201\n• **March 22**: Final Project Due - Physics Lab\n• **March 25**: Essay Submission - English Literature"
  },
  faculty: {
    "faculty information": "👨‍🏫 **Faculty Directory**\n\n• **Dr. Sarah Johnson** - Computer Science Dept.\n  📧 s.johnson@university.edu | 📞 (555) 123-4567\n  🕒 Office Hours: Mon-Wed 2-4 PM\n\n• **Prof. Michael Chen** - Mathematics Dept.\n  📧 m.chen@university.edu | 📞 (555) 234-5678\n  🕒 Office Hours: Tue-Thu 10 AM-12 PM",
    "office hours": "🕒 **Faculty Office Hours**\n\n• Most faculty hold office hours Tuesday-Thursday\n• Check individual faculty pages for specific times\n• Virtual office hours available via Zoom\n• Book appointments through the student portal"
  },
  dining: {
    "dining hours": "🍽️ **Dining Hall Hours**\n\n**Main Cafeteria**\n• Breakfast: 7:00 AM - 10:00 AM\n• Lunch: 11:30 AM - 2:30 PM\n• Dinner: 5:00 PM - 8:00 PM\n\n**Student Union Food Court**\n• Monday-Friday: 8:00 AM - 9:00 PM\n• Weekend: 10:00 AM - 8:00 PM",
    "menu": "📋 **Today's Menu**\n\n**Lunch Special**\n• Grilled Chicken with Rice\n• Vegetarian Pasta Primavera\n• Fresh Salad Bar\n• Daily Soup: Tomato Basil\n\n**Allergen-Free Options Available**"
  },
  library: {
    "library services": "📚 **Library Services**\n\n• **Study Spaces**: Individual & group study rooms\n• **Research Help**: Librarian assistance available\n• **Computer Lab**: 24/7 access with student ID\n• **Printing**: Black & white + color printing\n• **Digital Resources**: Access to academic databases",
    "library hours": "🕒 **Library Hours**\n\n• **Monday-Thursday**: 7:00 AM - 11:00 PM\n• **Friday**: 7:00 AM - 8:00 PM\n• **Saturday**: 9:00 AM - 6:00 PM\n• **Sunday**: 11:00 AM - 10:00 PM\n• **24/7 Study Area**: Always accessible"
  },
  admin: {
    "registration": "📝 **Course Registration**\n\n1. **Log in** to the student portal\n2. **Browse** available courses by department\n3. **Check** prerequisites and availability\n4. **Add** courses to your schedule\n5. **Submit** registration before deadline\n\n**Registration Dates**: March 1-15 for Fall semester",
    "financial aid": "💰 **Financial Aid**\n\n• **FAFSA Deadline**: March 1st annually\n• **Scholarships**: Check scholarship portal monthly\n• **Work-Study**: Applications due February 15th\n• **Emergency Funds**: Contact Student Services\n\n📞 Financial Aid Office: (555) 345-6789"
  }
};

const CampusAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Hello! I'm your Campus AI Assistant. I can help you with schedules, faculty information, dining services, library resources, and administrative procedures. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findRelevantInfo = (query: string): { content: string; category: string } => {
    const lowerQuery = query.toLowerCase();
    
    // Check each category for relevant keywords
    for (const [category, data] of Object.entries(campusData)) {
      for (const [key, content] of Object.entries(data)) {
        if (lowerQuery.includes(key) || 
            lowerQuery.includes(category) ||
            key.split(" ").some(word => lowerQuery.includes(word))) {
          return { content, category };
        }
      }
    }
    
    // Default response
    return {
      content: "I'd be happy to help! I can assist you with:\n\n🗓️ **Schedules** - Class schedules, exam dates\n👨‍🏫 **Faculty** - Directory, office hours\n🍽️ **Dining** - Hours, menus, locations\n📚 **Library** - Services, hours, resources\n📋 **Administration** - Registration, financial aid\n\nPlease let me know what specific information you need!",
      category: "general"
    };
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const { content, category } = findRelevantInfo(message);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content,
        isUser: false,
        timestamp: new Date(),
        category,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-campus-purple/5 to-campus-blue/10">
      {/* Header */}
      <div className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-10" style={{ boxShadow: 'var(--shadow-glow)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-campus-purple to-campus-blue bg-clip-text text-transparent">
                Campus AI Assistant
              </h1>
              <p className="text-sm text-muted-foreground">Your 24/7 colorful campus companion ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b gradient-rainbow/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className={`flex items-center gap-2 whitespace-nowrap text-xs transition-smooth ${getCategoryColor(action.category)}`}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="container mx-auto py-6 space-y-4 max-w-4xl">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full gradient-cool flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`flex flex-col gap-1 ${message.isUser ? "items-end" : "items-start"}`}>
                <div className={message.isUser ? "chat-bubble-user" : "chat-bubble-bot"}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.category && message.category !== "general" && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs border ${getCategoryBadgeColor(message.category)}`}
                    >
                      {message.category}
                    </Badge>
                  )}
                </div>
              </div>

              {message.isUser && (
                <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="chat-bubble-bot">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animation-bounce-gentle" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animation-bounce-gentle" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animation-bounce-gentle" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card/95 backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about campus services..."
              className="flex-1 bg-background"
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="bg-primary hover:bg-primary-hover transition-smooth"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusAssistant;