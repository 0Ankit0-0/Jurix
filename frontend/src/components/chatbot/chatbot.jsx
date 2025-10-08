import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { ScrollArea } from "../ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Send, Bot, User, MoreHorizontal, Plus, Sparkles, MessageSquare, Trash2, Settings, Copy, ThumbsUp, ThumbsDown, Menu, X, FileText } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { chatbotAPI, caseAPI } from "../../services/api"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import CaseUploadBackground from "@/components/ui/CaseUploadBackground"

const suggestedQuestions = [
    "What are the key elements of a contract?",
    "How do I prepare for a criminal defense case?",
    "What's the difference between civil and criminal law?",
    "How do I analyze evidence effectively?",
    "What are the steps in a legal simulation?",
    "How do I structure opening arguments?"
]

export default function ChatbotPage() {
    const { user } = useAuth()
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI legal assistant powered by advanced language models. I can help you with legal questions, case analysis, courtroom simulation guidance, and legal research. How can I assist you today?",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
        },
    ])
    const [inputMessage, setInputMessage] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mode, setMode] = useState("general") // "general" or "case_specific"
    const [selectedCaseId, setSelectedCaseId] = useState(null)
    const [myCases, setMyCases] = useState([])
    const [loadingCases, setLoadingCases] = useState(false)
    const [chatHistory, _setChatHistory] = useState([
        { id: 1, title: "Legal Assistant Chat", active: true, timestamp: new Date() },
        { id: 2, title: "Contract Law Questions", active: false, timestamp: new Date(Date.now() - 86400000) },
        { id: 3, title: "Criminal Case Analysis", active: false, timestamp: new Date(Date.now() - 172800000) },
        { id: 4, title: "Evidence Review Process", active: false, timestamp: new Date(Date.now() - 259200000) },
    ])
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        inputRef.current?.focus()
        if (user) {
            loadMyCases()
        }
    }, [user])

    const loadMyCases = async () => {
        if (!user) return
        
        try {
            setLoadingCases(true)
            const response = await caseAPI.getMyCases(user.id || user._id)
            setMyCases(response.data.cases || [])
        } catch (error) {
            console.error("Error loading cases:", error)
        } finally {
            setLoadingCases(false)
        }
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: "user",
            timestamp: new Date().toLocaleTimeString(),
        }

        setMessages((prev) => [...prev, userMessage])
        const currentMessage = inputMessage
        setInputMessage("")
        setIsTyping(true)

        try {
            // Prepare query data
            const queryData = {
                query: currentMessage,
                mode: mode,
            }

            // Add case_id if in case-specific mode
            if (mode === "case_specific" && selectedCaseId) {
                queryData.case_id = selectedCaseId
            }

            // Call chatbot API
            const response = await chatbotAPI.query(queryData)
            
            const botResponse = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: "bot",
                timestamp: new Date().toLocaleTimeString(),
                provider: response.data.provider,
            }

            setMessages((prev) => [...prev, botResponse])
            
        } catch (error) {
            console.error("Chatbot error:", error)
            
            // Fallback response on error
            const errorResponse = {
                id: Date.now() + 1,
                text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment. If the issue persists, you can still browse our legal resources or contact support.",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString(),
                provider: "error",
            }
            
            setMessages((prev) => [...prev, errorResponse])
            toast.error("Failed to get response. Please try again.")
        } finally {
            setIsTyping(false)
        }
    }

    const handleSuggestedQuestion = (question) => {
        setInputMessage(question)
        inputRef.current?.focus()
    }

    const clearHistory = () => {
        setMessages([
            {
                id: 1,
                text: "Hello! I'm your AI Legal Assistant. How can I assist you today?",
                sender: "bot",
                timestamp: new Date().toLocaleTimeString(),
            },
        ])
    }

    const copyMessage = (text) => {
        navigator.clipboard.writeText(text)
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="flex h-screen relative overflow-hidden">
            <CaseUploadBackground />
            {/*  Desktop Sidebar */}
            <div className="hidden md:flex w-72 bg-card/50 backdrop-blur-xl border-r border-border/50 flex-col shadow-xl">
                <div className="p-4 border-b border-border/50">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-11 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all duration-300 shadow-sm hover:shadow-md font-semibold"
                        onClick={clearHistory}
                    >
                        <Plus className="h-4 w-4" />
                        New chat
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-3">
                    <div className="space-y-2">
                        {chatHistory.map((chat) => (
                            <div
                                key={chat.id}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                                    chat.active 
                                        ? "bg-gradient-to-r from-primary/15 to-accent/10 text-foreground shadow-md border border-primary/20" 
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground hover:shadow-sm"
                                }`}
                            >
                                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{chat.title}</p>
                                    <p className="text-xs text-muted-foreground">{chat.timestamp.toLocaleDateString()}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-destructive/10">
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete chat
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                    <div className="fixed left-0 top-0 h-full w-64 bg-muted/20 border-r shadow-2xl">
                        <div className="p-3 border-b flex items-center justify-between">
                            <h2 className="font-semibold">Chats</h2>
                            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start mb-3"
                                onClick={() => {
                                    clearHistory()
                                    setSidebarOpen(false)
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New chat
                            </Button>
                            <div className="space-y-1">
                                {chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                                            chat.active ? "bg-muted text-foreground" : "hover:bg-muted/50 text-muted-foreground"
                                        }`}
                                    >
                                        {chat.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Enhanced Header */}
                <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl p-4 sm:p-5 flex-shrink-0 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden hover:bg-primary/10"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-foreground">Legal Assistant</h1>
                                    <p className="text-xs text-muted-foreground">AI-Powered Legal Guidance</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 ml-4">
                                <Button
                                    variant={mode === "general" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setMode("general")
                                        setSelectedCaseId(null)
                                    }}
                                    className={`text-xs font-semibold transition-all duration-300 ${
                                        mode === "general" 
                                            ? "bg-gradient-to-r from-primary to-accent shadow-md" 
                                            : "hover:bg-primary/10"
                                    }`}
                                >
                                    General
                                </Button>
                                <Button
                                    variant={mode === "case_specific" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMode("case_specific")}
                                    className={`text-xs font-semibold transition-all duration-300 ${
                                        mode === "case_specific" 
                                            ? "bg-gradient-to-r from-primary to-accent shadow-md" 
                                            : "hover:bg-primary/10"
                                    }`}
                                    disabled={!user || myCases.length === 0}
                                    title={!user ? "Login to use case-specific mode" : myCases.length === 0 ? "Create a case first" : "Case-specific mode"}
                                >
                                    Case-Specific
                                </Button>
                                {mode === "case_specific" && myCases.length > 0 && (
                                    <Select value={selectedCaseId || ""} onValueChange={setSelectedCaseId}>
                                        <SelectTrigger className="w-[200px] h-8 text-xs">
                                            <SelectValue placeholder="Select a case" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myCases.map((caseItem) => (
                                                <SelectItem key={caseItem.case_id} value={caseItem.case_id}>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-3 w-3" />
                                                        <span className="truncate max-w-[150px]">{caseItem.title}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearHistory}
                            className="hover:bg-primary/10 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Enhanced Messages Area */}
                <ScrollArea className="flex-1 bg-gradient-to-b from-transparent via-muted/5 to-transparent">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        {messages.length === 1 && (
                            <div className="text-center mb-12 animate-fade-in">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 animate-pulse-soft">
                                    <Bot className="h-8 w-8 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">How can I help you today?</h2>
                                <p className="text-muted-foreground mb-8">Ask me anything about legal matters, case analysis, or courtroom simulations</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="group p-5 text-left bg-card/50 backdrop-blur-sm hover:bg-card border-2 border-border/50 hover:border-primary/50 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                                        >
                                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{question}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div key={message.id} className="mb-8 animate-fade-in">
                                <div className="flex items-start space-x-4">
                                    <Avatar className={`h-10 w-10 flex-shrink-0 shadow-lg ${message.sender === "bot" ? "ring-2 ring-primary/20" : ""}`}>
                                        <AvatarFallback className={message.sender === "bot" ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-gradient-to-br from-muted to-muted/80"}>
                                            {message.sender === "bot" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="group">
                                            <div className={`p-4 rounded-2xl ${
                                                message.sender === "bot" 
                                                    ? "bg-card/50 backdrop-blur-sm border border-border/50 shadow-md" 
                                                    : "bg-primary/10 border border-primary/20 shadow-sm"
                                            }`}>
                                                <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap">{message.text}</p>
                                            </div>
                                            
                                            {message.sender === "bot" && (
                                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            copyMessage(message.text)
                                                            toast.success("Copied to clipboard")
                                                        }}
                                                        className="h-7 px-3 text-xs hover:bg-primary/10"
                                                    >
                                                        <Copy className="h-3 w-3 mr-1.5" />
                                                        Copy
                                                    </Button>
                                                    {message.provider && (
                                                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-md">
                                                            via {message.provider}
                                                        </span>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-success/10 hover:text-success">
                                                        <ThumbsUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive">
                                                        <ThumbsDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Enhanced Typing indicator */}
                        {isTyping && (
                            <div className="mb-8 animate-fade-in">
                                <div className="flex items-start space-x-4">
                                    <Avatar className="h-10 w-10 ring-2 ring-primary/20 shadow-lg">
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                            <Bot className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-md">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1.5">
                                                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
                                                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                                                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                                            </div>
                                            <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Enhanced Input Area */}
                <div className="border-t border-border/50 bg-card/30 backdrop-blur-xl p-4 sm:p-6 flex-shrink-0 shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative">
                            <Input
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about legal matters..."
                                className="pr-14 py-4 h-14 rounded-2xl border-2 border-border/50 focus:border-primary bg-card/50 backdrop-blur-sm text-base transition-all duration-300 shadow-sm focus:shadow-lg focus:shadow-primary/10 placeholder:text-muted-foreground/60"
                                disabled={isTyping}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
                            <Sparkles className="h-3 w-3" />
                            Legal Assistant can make mistakes. Verify important legal information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}