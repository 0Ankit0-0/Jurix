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
        <div className="flex h-screen bg-background overflow-hidden">
            {/*  Desktop */}
            <div className="hidden md:flex w-64 bg-muted/20 border-r border-border flex-col">
                <div className="p-3 border-b border-border">
                    <Button
                        variant="outline"
                        className="w-full justify-start hover:bg-background transition-all duration-200"
                        onClick={clearHistory}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New chat
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-2">
                    <div className="space-y-1">
                        {chatHistory.map((chat) => (
                            <div
                                key={chat.id}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    chat.active 
                                        ? "bg-muted text-foreground" 
                                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{chat.title}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
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

            {/* ChatGPT-like Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Simple Header */}
                <div className="border-b border-border p-3 sm:p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                            <h1 className="text-lg font-semibold text-foreground">Legal Assistant</h1>
                            <div className="hidden sm:flex items-center gap-2">
                                <Button
                                    variant={mode === "general" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setMode("general")
                                        setSelectedCaseId(null)
                                    }}
                                    className="text-xs"
                                >
                                    General
                                </Button>
                                <Button
                                    variant={mode === "case_specific" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMode("case_specific")}
                                    className="text-xs"
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
                        <Button variant="ghost" size="sm" onClick={clearHistory}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* ChatGPT-like Messages */}
                <ScrollArea className="flex-1">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        {messages.length === 1 && (
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bot className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h2 className="text-2xl font-semibold text-foreground mb-2">How can I help you today?</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="p-4 text-left bg-muted/50 hover:bg-muted rounded-xl transition-colors duration-200"
                                        >
                                            <p className="text-sm text-foreground">{question}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div key={message.id} className="mb-6 animate-fade-in">
                                <div className="flex items-start space-x-3">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className={message.sender === "bot" ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-muted"}>
                                            {message.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="group">
                                            <p className="text-sm sm:text-base leading-relaxed text-foreground mb-1">{message.text}</p>
                                            
                                            {message.sender === "bot" && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyMessage(message.text)}
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        <Copy className="h-3 w-3 mr-1" />
                                                        Copy
                                                    </Button>
                                                    {message.provider && (
                                                        <span className="text-xs text-muted-foreground">
                                                            via {message.provider}
                                                        </span>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                        <ThumbsUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                        <ThumbsDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Simple Typing indicator */}
                        {isTyping && (
                            <div className="mb-6 animate-fade-in">
                                <div className="flex items-start space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center space-x-2 py-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* ChatGPT-like Input */}
                <div className="border-t border-border p-4 flex-shrink-0">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Input
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Message Legal Assistant..."
                                className="pr-12 py-3 rounded-2xl border-border focus:border-primary bg-background text-base transition-all duration-200"
                                disabled={isTyping}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isTyping}
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Legal Assistant can make mistakes. Verify important legal information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}