import { useState, useEffect } from 'react';

const SAMPLES = [
  {
    title: 'The Productive Hustle',
    text: "I woke up at 6am, ran 5k, had a healthy salad for lunch, and studied for 3 hours. But I wasted 2 hours on Instagram at night.",
    results: [
      { name: '5km Run', type: 'productive', score: '+15' },
      { name: 'Healthy Salad', type: 'productive', score: '+10' },
      { name: 'Studied', type: 'productive', score: '+20' },
      { name: 'Instagram', type: 'distraction', score: '-10' },
    ]
  },
  {
    title: 'Balanced Saturday',
    text: "Slept in until 10am to catch up on rest. Read a book for an hour. Watched a movie and ordered pizza. Went for a short walk.",
    results: [
      { name: 'Catch Up Sleep', type: 'productive', score: '+5' },
      { name: 'Read Book', type: 'leisure', score: '+5' },
      { name: 'Pizza', type: 'leisure', score: '0' },
      { name: 'Short Walk', type: 'productive', score: '+10' },
    ]
  },
  {
    title: 'The Stressed Day',
    text: "Skipped breakfast because I was late. Sat at my desk for 8 straight hours. Skipped the gym, and ate junk food for dinner.",
    results: [
      { name: 'Skipped Breakfast', type: 'distraction', score: '-5' },
      { name: 'Sedentary Work', type: 'distraction', score: '-10' },
      { name: 'Skipped Gym', type: 'distraction', score: '-15' },
      { name: 'Junk Food', type: 'distraction', score: '-10' },
    ]
  }
];

export default function InteractiveSandbox() {
  const [activeSample, setActiveSample] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Typewriter effect logic
  useEffect(() => {
    setTypedText('');
    setShowResults(false);
    setIsParsing(false);
    
    let currentText = '';
    const fullText = SAMPLES[activeSample].text;
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < fullText.length) {
        currentText += fullText[i];
        setTypedText(currentText);
        i++;
      } else {
        clearInterval(interval);
        setIsParsing(true);
        setTimeout(() => {
          setIsParsing(false);
          setShowResults(true);
        }, 1200); // Simulate Gemini AI processing delay
      }
    }, 40); // 40ms typing speed
    
    return () => clearInterval(interval);
  }, [activeSample]);

  return (
    <div className="sandbox-container glass-panel p-6 sm:p-8 relative mt-8 mb-12">
      <div className="flex flex-wrap gap-4 mb-6">
        {SAMPLES.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (activeSample !== idx) {
                 setActiveSample(idx);
              }
            }}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeSample === idx 
                ? 'bg-primary text-white' 
                : 'bg-surface-elevated text-text-secondary hover:text-white border border-border'
            }`}
            style={{ 
              backgroundColor: activeSample === idx ? 'var(--primary)' : 'var(--surface-el)',
              color: activeSample === idx ? '#fff' : 'var(--text-sec)',
              border: activeSample !== idx ? '1px solid var(--border)' : '1px solid transparent'
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      
      <div className="mb-8 relative">
        <h3 className="text-[0.8rem] uppercase tracking-wider font-bold mb-3" style={{ color: 'var(--text-sec)' }}>
          Write or speak naturally
        </h3>
        <div 
          className="rounded-xl p-5 min-h-[120px] font-medium text-lg leading-relaxed relative"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {typedText}
          {!showResults && <span className="inline-block w-2 h-5 ml-1 animate-pulse align-middle" style={{ backgroundColor: 'var(--primary)' }}></span>}
          
          {isParsing && (
            <div className="absolute inset-0 rounded-xl flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(19, 19, 26, 0.7)' }}>
              <div className="flex items-center gap-3 font-bold" style={{ color: 'var(--primary)' }}>
                <span className="spinner" style={{ width: 24, height: 24, borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></span>
                Praxis AI Parsing...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`transition-all duration-700 ease-out ${showResults ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8 pointer-events-none'}`}>
        <h3 className="text-[0.8rem] uppercase tracking-wider font-bold mb-3" style={{ color: 'var(--text-sec)' }}>
          AI Automatically Extracts
        </h3>
        <div className="flex flex-wrap gap-3">
          {SAMPLES[activeSample].results.map((r, i) => (
            <div 
              key={i} 
              className={`px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm`}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid',
                borderColor: r.type === 'productive' ? 'rgba(52,211,153,0.3)' : r.type === 'distraction' ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'
              }}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: r.type === 'productive' ? 'var(--success)' : r.type === 'distraction' ? 'var(--danger)' : 'var(--warning)' }}
              ></div>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>{r.name}</span>
              <span className="text-sm font-bold" style={{ color: r.type === 'productive' ? 'var(--success)' : r.type === 'distraction' ? 'var(--danger)' : 'var(--warning)' }}>
                {r.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
