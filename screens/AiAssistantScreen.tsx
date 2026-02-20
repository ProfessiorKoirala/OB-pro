
import React, { useState, useEffect, useRef } from 'react';
import { AppDataBackup, MainView } from '../types';
import { GoogleGenAI } from '@google/genai';
import SparklesIcon from '../components/icons/SparklesIcon';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}

interface AiAssistantScreenProps {
  appData: AppDataBackup;
  setCurrentView?: (view: MainView) => void;
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const processOfflineQuery = (query: string, data: AppDataBackup): string => {
    const q = query.toLowerCase().trim();
    const now = new Date();
    
    // Guard against missing data
    const orders = data?.orders || [];
    const expenses = data?.expenses || [];
    const products = data?.products || [];
    const payments = data?.payments || [];
    
    // --- Date Parsing ---
    const getPeriodRange = (period: 'today' | 'yesterday' | 'this week' | 'last week' | 'this month' | 'last month'): [Date, Date] => {
        const start = new Date();
        const end = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        switch (period) {
            case 'today':
                break;
            case 'yesterday':
                start.setDate(now.getDate() - 1);
                end.setDate(now.getDate() - 1);
                break;
            case 'this week':
                start.setDate(now.getDate() - now.getDay());
                break;
            case 'last week':
                end.setDate(now.getDate() - now.getDay() - 1);
                start.setDate(end.getDate() - 6);
                break;
            case 'this month':
                start.setDate(1);
                break;
            case 'last month':
                start.setMonth(now.getMonth() - 1, 1);
                end.setMonth(now.getMonth(), 0);
                break;
        }
        return [start, end];
    };

    let period: 'today' | 'yesterday' | 'this week' | 'last week' | 'this month' | 'last month' | null = null;
    if (q.includes('today')) period = 'today';
    else if (q.includes('yesterday')) period = 'yesterday';
    else if (q.includes('this week')) period = 'this week';
    else if (q.includes('last week')) period = 'last week';
    else if (q.includes('this month')) period = 'this month';
    else if (q.includes('last month')) period = 'last month';

    // --- SALES QUERIES ---
    if (q.includes('sales') || q.includes('orders') || q.includes('revenue')) {
        const periodName = period || 'today';
        const [start, end] = getPeriodRange(periodName);
        const periodOrders = orders.filter(o => o.timestamp >= start.getTime() && o.timestamp <= end.getTime());

        if (/how many|number of/i.test(q)) {
            return `There were ${periodOrders.length} orders ${periodName}.`;
        }
        
        if (/top.*selling|best.*selling/i.test(q)) {
            const productSales: { [key: string]: { name: string, quantity: number } } = {};
            periodOrders.forEach(order => {
                order.items.forEach(item => {
                    if (!productSales[item.product.id]) {
                        productSales[item.product.id] = { name: item.product.name, quantity: 0 };
                    }
                    productSales[item.product.id].quantity += item.quantity;
                });
            });
            const topProducts = Object.values(productSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
                .map((p, i) => `${i + 1}. ${p.name} (${p.quantity} units)`);

            if (topProducts.length === 0) return `There were no product sales ${periodName}.`;
            return `The top selling products for ${periodName} were:\n${topProducts.join('\n')}`;
        }

        const total = periodOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        return `Total sales for ${periodName} are ${formatCurrency(total)} from ${periodOrders.length} orders.`;
    }

    // --- EXPENSES QUERIES ---
    if (q.includes('expense')) {
        const periodName = period || 'this month';
        const [start, end] = getPeriodRange(periodName);
        const periodExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate >= start && expenseDate <= end;
        });

        if (/by category/i.test(q)) {
            const byCategory: { [key: string]: number } = {};
            periodExpenses.forEach(e => {
                byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
            });
            const categorySummary = Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, total]) => `- ${cat}: ${formatCurrency(total)}`);
            if (categorySummary.length === 0) return `No expenses found for ${periodName}.`;
            return `Expenses by category for ${periodName}:\n${categorySummary.join('\n')}`;
        }
        
        if (/biggest|largest/i.test(q)) {
            if (periodExpenses.length === 0) return `No expenses found for ${periodName}.`;
            const biggestExpense = [...periodExpenses].sort((a,b) => b.amount - a.amount)[0];
            return `The biggest expense for ${periodName} was "${biggestExpense.title}" for ${formatCurrency(biggestExpense.amount)}.`;
        }

        const total = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
        if (periodExpenses.length === 0) return `You have no recorded expenses for ${periodName}.`;
        return `You have spent ${formatCurrency(total)} in ${periodName} across ${periodExpenses.length} expenses.`;
    }
    
    // --- INVENTORY QUERIES ---
    if (q.includes('inventory') || q.includes('stock')) {
        if (/total value/i.test(q)) {
            const totalValue = products
                .filter(p => p.trackStock && p.stock)
                .reduce((sum, p) => sum + (p.stock! * p.price), 0);
            return `The total value of your tracked inventory is ${formatCurrency(totalValue)}.`;
        }
        
        if (/out of stock/i.test(q)) {
            const outOfStock = products.filter(p => p.trackStock && (p.stock || 0) === 0);
            if(outOfStock.length === 0) return "No products are out of stock.";
            return `The following items are out of stock: ${outOfStock.map(p => p.name).join(', ')}.`;
        }

        if (/low on stock|low stock/i.test(q)) {
            const lowStockItems = products.filter(p => p.trackStock && p.stock && p.stock > 0 && p.stock <= 10);
            if (lowStockItems.length === 0) return "No products are currently low on stock.";
            return `You have ${lowStockItems.length} item(s) low on stock (<= 10 units): ${lowStockItems.map(p => `${p.name} (${p.stock})`).join(', ')}.`;
        }

        const stockMatch = q.match(/stock of (.*)/i);
        if (stockMatch && stockMatch[1]) {
            const productName = stockMatch[1].trim();
            const product = products.find(p => p.name.toLowerCase() === productName);
            if (!product) return `Sorry, I couldn't find a product named "${productName}".`;
            if (!product.trackStock) return `Stock is not tracked for ${product.name}.`;
            return `The current stock for ${product.name} is ${product.stock || 0} units.`;
        }
    }

    // --- CUSTOMER QUERIES ---
    if (q.includes('customer') || q.includes('credit')) {
        if (/outstanding credit/i.test(q)) {
            const totalCredit = orders.filter(o => o.paymentMethod === 'Credit').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            const totalPaid = payments.filter(p => p.type === 'Credit Payment').reduce((sum, p) => sum + p.amount, 0);
            const totalAdvanceReturned = payments.filter(p => p.type === 'Advance Return').reduce((sum, p) => sum + p.amount, 0);
            const outstanding = totalCredit - totalPaid + totalAdvanceReturned;
            return `The total outstanding credit from all customers is ${formatCurrency(outstanding)}.`;
        }
        
        if (/best customers|top customers/i.test(q)) {
            const customerSales: { [key: string]: { name: string, total: number } } = {};
            orders.forEach(o => {
                const customerName = o.customerName || 'Walk-in';
                if(customerName !== 'Walk-in') {
                   if (!customerSales[customerName]) customerSales[customerName] = { name: customerName, total: 0 };
                   customerSales[customerName].total += (o.grandTotal || 0);
                }
            });
            const topCustomers = Object.values(customerSales)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
                .map((c, i) => `${i + 1}. ${c.name} (${formatCurrency(c.total)})`);
            
            if (topCustomers.length === 0) return "There is not enough sales data to determine top customers.";
            return `Your top customers by sales (all time) are:\n${topCustomers.join('\n')}`;
        }
    }

    return "I can answer questions about sales, expenses, inventory, and customers while offline. For example: 'What were my sales yesterday?' or 'Show me out-of-stock items'. For more complex questions, please connect to the internet.";
};


const suggestedPrompts = [
    "What were my total sales today?",
    "Summarize my expenses for this month.",
    "Which products are low on stock?",
    "Who are my top 5 customers?",
];

const AiAssistantScreen: React.FC<AiAssistantScreenProps> = ({ appData, setCurrentView }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: "Hello! I'm your AI Business Assistant. You can ask me about your sales, expenses, or inventory." }
  ]);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: promptText };
    const loadingMessage: Message = { id: Date.now() + 1, sender: 'ai', text: '...', isLoading: true };

    setMessages(prev => [...prev, userMessage, loadingMessage]);

    let aiResponseText = '';

    if (isOnline) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const contextSummary = `
            - Total Products: ${appData?.products?.length || 0}
            - Total Sales (all time): ${appData?.orders?.length || 0}
            - Total Expenses (all time): ${appData?.expenses?.length || 0}
            - Product Categories: ${[...new Set((appData?.products || []).map(p => p.category))].join(', ')}
            - Expense Categories: ${[...new Set((appData?.expenses || []).map(e => e.category))].join(', ')}
        `;
        const prompt = `You are a helpful business assistant for a small business owner. Based on the following summary and the user's question, provide a concise and helpful response.
        Context Summary: ${contextSummary}
        User's Question: "${userMessage.text}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        aiResponseText = response.text || 'No response from AI.';
      } catch (error) {
        console.error("Gemini API error:", error);
        aiResponseText = "Sorry, I had trouble connecting to the online AI. Switching to offline mode. " + processOfflineQuery(userMessage.text, appData);
      }
    } else {
      aiResponseText = processOfflineQuery(userMessage.text, appData);
    }

    setMessages(prev => prev.map(msg => 
      msg.id === loadingMessage.id ? { ...msg, text: aiResponseText, isLoading: false } : msg
    ));
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
      setInput('');
  };
  
  const handleSuggestionClick = (prompt: string) => {
      setInput(''); 
      sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center shrink-0">
        {setCurrentView && (
          <button onClick={() => setCurrentView(MainView.DASHBOARD)} className="p-2 -ml-2 mr-2 text-gray-600 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        )}
        <div className="flex items-center space-x-3">
            <SparklesIcon className="h-7 w-7 text-primary dark:text-white" />
            <div>
                 <h1 className="text-xl font-bold text-text-primary dark:text-gray-100">AI Assistant</h1>
                 <div className="flex items-center space-x-1.5 text-xs font-medium">
                     <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                     <span className={isOnline ? 'text-green-600' : 'text-gray-500'}>{isOnline ? 'Online (Gemini)' : 'Offline'}</span>
                 </div>
            </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 dark:bg-white/10 flex items-center justify-center shrink-0 mb-1">
                <SparklesIcon className="w-5 h-5 text-primary dark:text-white" />
              </div>
            )}
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${
              msg.sender === 'user' 
                ? 'bg-primary dark:bg-white text-white dark:text-black rounded-br-md' 
                : 'bg-white dark:bg-gray-800 text-text-primary dark:text-gray-100 rounded-bl-md shadow-sm border dark:border-gray-700'
            }`}>
              {msg.isLoading ? (
                  <div className="flex space-x-1 p-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                  </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {messages.length === 1 && (
            <div className="pt-4 animate-fade-in">
                <h3 className="font-semibold text-text-secondary dark:text-gray-400 text-sm mb-3 text-center">Or try one of these suggestions</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedPrompts.map(prompt => (
                        <button key={prompt} onClick={() => handleSuggestionClick(prompt)} className="text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 text-primary dark:text-white font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 dark:hover:bg-white/5">
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="sticky bottom-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t dark:border-gray-700 shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-600"
          />
          <button type="submit" className="bg-primary dark:bg-white text-white dark:text-black w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default AiAssistantScreen;
