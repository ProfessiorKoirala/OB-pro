import React, { useState } from 'react';
import { MainView } from '../types';
import HomeIcon from '../components/icons/HomeIcon';

interface CalculatorScreenProps {
  setCurrentView: (view: MainView) => void;
  isDesktop?: boolean;
  onHome?: () => void;
}

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const CalculatorButton: React.FC<{
  onClick: () => void;
  label: React.ReactNode;
  className?: string;
  ariaLabel: string;
}> = ({ onClick, label, className = '', ariaLabel }) => (
  <button
    onClick={onClick}
    className={`h-16 sm:h-20 text-2xl sm:text-3xl font-semibold rounded-2xl flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 ${className}`}
    aria-label={ariaLabel}
  >
    {label}
  </button>
);

const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ setCurrentView, isDesktop, onHome }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleInput = (value: string) => {
    if (error) {
      setError('');
      setInput(value);
      setResult('');
      return;
    }
    // Prevent leading zeros if not a decimal
    if (input === '0' && value !== '.') {
        setInput(value);
        return;
    }
    setInput(prev => prev + value);
  };

  const clear = () => {
    setInput('');
    setResult('');
    setError('');
  };

  const backspace = () => {
    if (error) {
      clear();
      return;
    }
    setInput(prev => prev.slice(0, -1));
  };

  const calculate = () => {
    if (!input || error) return;
    try {
      const expression = input.replace(/×/g, '*').replace(/÷/g, '/');
      
      if (/[^0-9+\-*/.() ]/.test(expression)) {
        throw new Error("Invalid characters");
      }
      
      const lastChar = expression.trim().slice(-1);
      if (['+', '-', '*', '/'].includes(lastChar)) {
        throw new Error("Trailing operator");
      }

      const calculatedResult = new Function('return ' + expression)();
      
      if (isNaN(calculatedResult) || !isFinite(calculatedResult)) {
        throw new Error("Invalid calculation");
      }

      const finalResult = parseFloat(calculatedResult.toPrecision(15));
      setResult(String(finalResult));
      setInput(String(finalResult));
      setError('');
    } catch (e) {
      setError('Error');
      setResult('');
    }
  };

  const handleOperator = (op: string) => {
    if (error) {
        setError('');
        setResult('');
        setInput(result + op);
        return;
    }
    if (input === '' && op !== '-') return;
    const lastChar = input.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setInput(prev => prev.slice(0, -1) + op);
    } else {
      setInput(prev => prev + op);
    }
  };

  const handleDecimal = () => {
    if (error) clear();
    const parts = input.split(/[+\-×÷]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes('.')) {
      setInput(prev => prev.length === 0 ? '0.' : prev + '.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-white shadow-sm p-4 flex items-center shrink-0">
        {!isDesktop && <button onClick={() => setCurrentView(MainView.DASHBOARD)} className="p-2 -ml-2 text-gray-600"><ArrowLeftIcon /></button>}
        <h1 className="text-xl font-black text-black italic uppercase tracking-tighter text-center flex-grow">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span></h1>
        <div className="flex items-center gap-2">
            {onHome && (
                <button onClick={onHome} className="p-2 text-gray-400 hover:text-black transition-all">
                    <HomeIcon className="w-6 h-6" />
                </button>
            )}
        </div>
      </header>
      
      <div className="flex-grow p-6 flex flex-col justify-end">
        <div className="text-right space-y-2 min-h-[100px]">
          <div className="text-gray-500 text-2xl sm:text-3xl h-10 font-light overflow-x-auto break-all" style={{scrollBehavior: 'smooth'}}>{input || '0'}</div>
          <div className="text-primary font-bold text-4xl sm:text-5xl h-14 break-all">{error || result || ''}</div>
        </div>
      </div>
      
      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-t-3xl shadow-t-lg">
        <div className="grid grid-cols-4 gap-3">
          <CalculatorButton onClick={clear} label="AC" ariaLabel="All Clear" className="bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300" />
          <CalculatorButton onClick={backspace} label="⌫" ariaLabel="Backspace" className="bg-gray-200 text-text-primary hover:bg-gray-300 active:bg-gray-400" />
          <CalculatorButton onClick={() => handleOperator('÷')} label="÷" ariaLabel="Divide" className="bg-blue-100 text-primary hover:bg-blue-200 active:bg-blue-300" />
          <CalculatorButton onClick={() => handleOperator('×')} label="×" ariaLabel="Multiply" className="bg-blue-100 text-primary hover:bg-blue-200 active:bg-blue-300" />
          
          <CalculatorButton onClick={() => handleInput('7')} label="7" ariaLabel="7" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleInput('8')} label="8" ariaLabel="8" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleInput('9')} label="9" ariaLabel="9" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleOperator('-')} label="-" ariaLabel="Subtract" className="bg-blue-100 text-primary hover:bg-blue-200 active:bg-blue-300" />
          
          <CalculatorButton onClick={() => handleInput('4')} label="4" ariaLabel="4" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleInput('5')} label="5" ariaLabel="5" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleInput('6')} label="6" ariaLabel="6" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleOperator('+')} label="+" ariaLabel="Add" className="bg-blue-100 text-primary hover:bg-blue-200 active:bg-blue-300" />
          
          <CalculatorButton onClick={() => handleInput('1')} label="1" ariaLabel="1" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleInput('2')} label="2" ariaLabel="2" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={() => handleInput('3')} label="3" ariaLabel="3" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={calculate} label="=" ariaLabel="Equals" className="row-span-2 bg-primary text-white hover:bg-blue-800 active:bg-blue-900" />
          
          <CalculatorButton onClick={() => handleInput('0')} label="0" ariaLabel="0" className="col-span-2 bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
          <CalculatorButton onClick={handleDecimal} label="." ariaLabel="Decimal" className="bg-gray-100 text-text-primary hover:bg-gray-200 active:bg-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default CalculatorScreen;