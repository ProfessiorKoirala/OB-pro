
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Note, NoteCategory, BusinessProfile } from '../types';
import BackIcon from '../components/icons/BackIcon';
import HomeIcon from '../components/icons/HomeIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface NotesScreenProps {
  notes: Note[];
  categories: NoteCategory[];
  onUpdateNotes: (notes: Note[]) => void;
  onUpdateCategories: (categories: NoteCategory[]) => void;
  onBack: () => void;
  onHome?: () => void;
  businessProfile: BusinessProfile;
}

type PenType = 'ball' | 'sketch' | 'fountain';

const formatTimestamp = (ts: number) => {
  const date = new Date(ts);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

const NoteCard: React.FC<{
  note: Note;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ note, onClick, onDelete }) => {
  const getTextSnippet = (html?: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="flex flex-col animate-fade-in group w-full mb-4">
      <button
        onClick={onClick}
        className="w-full bg-white dark:bg-gray-800 rounded-[32px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center aspect-[3/4.2] overflow-hidden relative transition-all active:scale-[0.97] active:shadow-inner"
      >
        <div className="absolute inset-0 p-6 text-left opacity-90 pointer-events-none overflow-hidden">
          <div className="text-[12px] font-medium text-gray-700 dark:text-gray-300 line-clamp-[12] leading-relaxed">
            {note.text?.startsWith('<') ? (
              <div dangerouslySetInnerHTML={{ __html: note.text }} />
            ) : (
              note.text
            )}
          </div>
        </div>
        {note.drawingData && (
          <img src={note.drawingData} alt="Sketch Overlay" className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80" />
        )}
        <div 
          onClick={(e) => { e.stopPropagation(); onDelete(e); }} 
          className="absolute top-4 right-4 w-9 h-9 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity active:scale-90"
        >
          <TrashIcon className="w-4 h-4 text-gray-400" />
        </div>
      </button>
      <div className="mt-4 text-center px-2">
        <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white truncate leading-tight mb-1 uppercase tracking-tighter italic">
          {note.title || getTextSnippet(note.text).split('\n')[0].substring(0, 20) || 'Untitled'}
        </h3>
        <p className="text-[12px] text-gray-400 font-bold tracking-tight">
          {formatTimestamp(note.timestamp)}
        </p>
      </div>
    </div>
  );
};

const SketchCanvas: React.FC<{
  onSave: (data: string) => void;
  initialData?: string;
  activeColor: string;
  tool: 'pen' | 'highlighter' | 'eraser';
  penType: PenType;
  undoTrigger?: number;
  redoTrigger?: number;
  disabled?: boolean;
}> = ({ onSave, initialData, activeColor, tool, penType, undoTrigger, redoTrigger, disabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // High Quality Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // --- QUALITY UPGRADE: High-DPI Handling ---
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialData) {
      const img = new Image();
      img.src = initialData;
      img.onload = () => {
        // Draw image scaled down from its DPI
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        if (history.length === 0) {
          setHistory([initialData]);
          setHistoryIndex(0);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (undoTrigger && historyIndex > 0) restoreFromHistory(historyIndex - 1);
  }, [undoTrigger]);

  useEffect(() => {
    if (redoTrigger && historyIndex < history.length - 1) restoreFromHistory(historyIndex + 1);
  }, [redoTrigger]);

  const restoreFromHistory = (index: number) => {
    const data = history[index];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && data && canvas) {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
        setHistoryIndex(index);
        onSave(data);
      };
    }
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { 
        x: (clientX - rect.left), 
        y: (clientY - rect.top) 
    };
  };

  const startDrawing = (e: any) => {
    if (disabled) return;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 40;
      ctx.globalAlpha = 1;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 30;
      ctx.globalAlpha = 0.3;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = activeColor;
      ctx.globalAlpha = 1;
      
      // Select pen width based on type
      switch (penType) {
        case 'ball': ctx.lineWidth = 2.5; break;
        case 'sketch': ctx.lineWidth = 6; break;
        case 'fountain': ctx.lineWidth = 14; break;
        default: ctx.lineWidth = 2.5;
      }
    }
  };

  const draw = (e: any) => {
    if (!isDrawing || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (disabled) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      const newHistory = [...history.slice(0, historyIndex + 1), data].slice(-20);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      onSave(data);
    }
  };

  return (
    <div ref={containerRef} className={`absolute inset-0 bg-transparent ${disabled ? 'pointer-events-none' : 'cursor-crosshair touch-none'}`}>
      <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={endDrawing} className="block" />
    </div>
  );
};

const NoteEditor: React.FC<{
  note: Note | null;
  onClose: () => void;
  onSave: (title: string, text: string, drawingData?: string) => void;
  onDelete: (id: string) => void;
}> = ({ note, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [text, setText] = useState(note?.text || '');
  const [drawingData, setDrawingData] = useState(note?.drawingData);
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penType, setPenType] = useState<PenType>('ball');
  const [isSketchActive, setIsSketchActive] = useState(false);
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [redoTrigger, setRedoTrigger] = useState(0);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const colors = ['#000000', '#F43F5E', '#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#D946EF', '#FFC107'];

  const handleCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    const finalContent = editorRef.current?.innerHTML || '';
    onSave(title, finalContent, drawingData);
  };

  const handleDelete = () => {
    if (note && confirm('Permanently delete this note?')) {
      onDelete(note.id);
      onClose();
    } else if (!note) onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#f8f8f8] dark:bg-gray-950 flex flex-col animate-slide-up font-sans">
      {/* Header: App name Left, Colors Right */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between shrink-0 bg-transparent">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 text-black dark:text-white active:scale-90 transition-all">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h1 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB Pro</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => {
                  setActiveColor(c);
                  if (!isSketchActive) handleCommand('foreColor', c);
                }} 
                style={{ backgroundColor: c }} 
                className={`w-6 h-6 rounded-full border-2 transition-all ${activeColor === c ? 'scale-110 ring-2 ring-black dark:ring-white border-white' : 'border-transparent opacity-60'}`} 
              />
            ))}
          </div>
          <button onClick={handleSave} className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-lg active:scale-90 transition-all" title="Save">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>

      {/* Title Bar */}
      <div className="px-10 pb-2">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title..."
          className="text-xs font-black bg-transparent outline-none border-none p-0 text-gray-400 dark:text-gray-500 placeholder:text-gray-300 w-full uppercase tracking-widest"
        />
      </div>

      {/* Dynamic Toolbar */}
      <div className="flex flex-col gap-2 px-6 shrink-0 bg-[#f8f8f8] dark:bg-gray-950 pb-4 border-b dark:border-gray-900/50">
        <div className="flex gap-2 items-center overflow-x-auto no-scrollbar py-2">
          {/* Toggle Mode */}
          <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl shrink-0">
             <button onClick={() => setIsSketchActive(false)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!isSketchActive ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}>Type</button>
             <button onClick={() => setIsSketchActive(true)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isSketchActive ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-400'}`}>Draw</button>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-800 mx-1 shrink-0"></div>

          <div className="flex gap-2 items-center shrink-0">
            {!isSketchActive ? (
              <>
                <button onClick={() => handleCommand('bold')} className="w-9 h-9 flex items-center justify-center font-black text-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100">B</button>
                <button onClick={() => handleCommand('italic')} className="w-9 h-9 flex items-center justify-center font-serif italic text-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100">I</button>
                <select 
                  onChange={(e) => handleCommand('fontSize', e.target.value)} 
                  className="bg-white dark:bg-gray-800 text-[11px] font-black px-3 py-2 rounded-xl border border-gray-100 outline-none shadow-sm h-9"
                  defaultValue="3"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <div className="flex gap-1">
                  <button onClick={() => handleCommand('justifyLeft')} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg></button>
                  <button onClick={() => handleCommand('justifyCenter')} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z"/></svg></button>
                </div>
              </>
            ) : (
              <>
                {/* Pen Selectors: Ball, Sketch, Fountain */}
                <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl shrink-0 gap-1">
                  {(['ball', 'sketch', 'fountain'] as PenType[]).map(pt => (
                    <button 
                      key={pt} 
                      onClick={() => { setActiveTool('pen'); setPenType(pt); }}
                      className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${activeTool === 'pen' && penType === pt ? 'bg-black text-white' : 'text-gray-500'}`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
                <button onClick={() => setActiveTool('highlighter')} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTool === 'highlighter' ? 'bg-yellow-400 text-black shadow-inner scale-105' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`} title="Highlighter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 14l3 3L21 5l-3-3L6 14zm-4 8l1.5-5.5L7 22l-5 0z"/></svg>
                </button>
                <button onClick={() => setActiveTool('eraser')} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-[#FF719A] text-white shadow-lg border-white' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`} title="Eraser">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 01-5.66 0L2.81 17.02a2.002 2.002 0 010-2.83l9.53-9.53c.79-.78 2.05-.78 2.84 0l1.06 1.06v-2.16z"/></svg>
                </button>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-800 mx-1 shrink-0"></div>
          
          <div className="flex gap-2 shrink-0">
            <button onClick={() => isSketchActive ? setUndoTrigger(Date.now()) : handleCommand('undo')} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400 border border-gray-100 active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M3 10h10a8 8 0 018 8v2M3 10l4-4m-4 4l4 4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            <button onClick={() => isSketchActive ? setRedoTrigger(Date.now()) : handleCommand('redo')} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-sm text-gray-400 border border-gray-100 active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M21 10H11a8 8 0 00-8 8v2m18-10l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            <button onClick={handleDelete} className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500 active:scale-90 border border-red-100"><TrashIcon className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      {/* Main Surface */}
      <main className="flex-1 px-4 sm:px-12 pb-12 overflow-hidden flex flex-col pt-2">
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative border-2 border-gray-100 dark:border-gray-800">
          <div
            ref={editorRef}
            contentEditable
            autoFocus
            onInput={() => setText(editorRef.current?.innerHTML || '')}
            style={{ color: !isSketchActive ? activeColor : 'inherit' }}
            className="w-full h-full p-10 text-[18px] font-medium outline-none overflow-y-auto leading-relaxed z-0"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          <SketchCanvas initialData={drawingData} activeColor={activeColor} tool={activeTool} penType={penType} undoTrigger={undoTrigger} redoTrigger={redoTrigger} disabled={!isSketchActive} onSave={setDrawingData} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none opacity-50"><div className="h-px w-8 bg-gray-100"></div><span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Page 1 / 1</span><div className="h-px w-8 bg-gray-100"></div></div>
        </div>
      </main>
    </div>
  );
};

const NotesScreen: React.FC<NotesScreenProps> = ({ notes, categories, onUpdateNotes, onBack, onHome }) => {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const sortedNotes = useMemo(() => [...notes].sort((a, b) => b.timestamp - a.timestamp), [notes]);

  const handleSaveNote = (title: string, text: string, drawingData?: string) => {
    if (!title.trim() && !text.trim() && !drawingData) {
      setEditingNote(null); setIsAddingNote(false); return;
    }
    if (editingNote) {
      onUpdateNotes(notes.map(n => n.id === editingNote.id ? { ...n, title: title.trim(), text, drawingData, timestamp: Date.now() } : n));
    } else {
      onUpdateNotes([{ id: `note-${Date.now()}`, categoryId: categories[0].id, type: 'text', title: title.trim(), text, drawingData, timestamp: Date.now() }, ...notes]);
    }
    setEditingNote(null); setIsAddingNote(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f8f8] dark:bg-gray-950 transition-colors font-sans overflow-hidden">
      {(editingNote || isAddingNote) && <NoteEditor note={editingNote} onClose={() => { setEditingNote(null); setIsAddingNote(false); }} onSave={handleSaveNote} onDelete={(id) => onUpdateNotes(notes.filter(n => n.id !== id))} />}
      <header className="px-6 pt-12 pb-6 shrink-0 bg-[#f8f8f8] dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-gray-800 dark:text-white active:scale-90 transition-all"><BackIcon className="w-7 h-7" /></button>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter italic uppercase leading-none">Registry</h1>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mt-2 italic leading-none">Global Notes Archives</p>
            </div>
          </div>
          {onHome && <button onClick={onHome} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-700"><HomeIcon className="w-6 h-6" /></button>}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar pb-40">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10">
          {sortedNotes.map((note) => <NoteCard key={note.id} note={note} onClick={() => setEditingNote(note)} onDelete={() => onUpdateNotes(notes.filter(n => n.id !== note.id))} />)}
          {sortedNotes.length === 0 && <div className="col-span-full py-48 text-center opacity-10"><svg className="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg><p className="font-extrabold text-2xl uppercase tracking-tighter italic">Your Story Starts Here</p></div>}
        </div>
      </main>
      <div className="fixed bottom-10 right-10 z-40"><button onClick={() => setIsAddingNote(true)} className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex items-center justify-center active:scale-90 transition-all border border-black dark:border-white"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button></div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default NotesScreen;
