import { useState, useEffect } from 'react'

const API_BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "test_key";

function App() {
  const [prompt, setPrompt] = useState("");
  const [claudeResponse, setClaudeResponse] = useState("");
  const [openaiResponse, setOpenaiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [apiError, setApiError] = useState("");
  const [judgeModel, setJudgeModel] = useState("ollama/llama3");
  const [apiHealthy, setApiHealthy] = useState(false);

  useEffect(() => {
    checkHealth();
    fetchHistory();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        headers: { "X-API-Key": API_KEY }
      });
      const data = await res.json();
      setApiHealthy(Boolean(data?.data?.judge_ready));
    } catch (_err) {
      setApiHealthy(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history`, {
        headers: { "X-API-Key": API_KEY }
      });
      const data = await res.json();
      if (data.status === "success") {
        setHistory(data.data);
      }
      setApiError("");
    } catch (err) {
      setApiError("Unable to reach backend history endpoint.");
    }
  };

  const handleEvaluate = async () => {
    if (!prompt) return alert("Please enter a prompt!");
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_BASE_URL}/evaluate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY
        },
        body: JSON.stringify({
          prompt,
          claude_response: claudeResponse,
          openai_response: openaiResponse,
          judge_model: judgeModel,
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setPrompt("");
        setClaudeResponse("");
        setOpenaiResponse("");
        fetchHistory();
      } else {
        setApiError(data.detail || "Evaluation failed.");
      }
    } catch (err) {
      setApiError(err.message || "Request failed.");
    }
    setLoading(false);
  };

  const MetricBar = ({ label, value, colorHex }) => {
    const safeScore = value !== undefined && value !== null ? Number(value) : 0;
    const isSafe = label.toLowerCase() === 'toxicity' ? safeScore > 0.5 : safeScore > 0.5; 
    
    // Convert 0-1 scale to percentage
    const widthPercentage = Math.min(100, Math.max(0, safeScore * 100));
    
    return (
      <div className="flex flex-col gap-1.5 mb-4 group">
        <div className="flex justify-between items-end">
          <span className="text-[11px] font-mono font-medium tracking-widest uppercase text-[#aaabb0] group-hover:text-[#f6f6fc] transition-colors">{label}</span>
          <span className="text-[13px] font-mono font-bold" style={{ color: colorHex }}>{safeScore.toFixed(2)}</span>
        </div>
        <div className="h-2 w-full bg-[#111318] rounded-full overflow-hidden shadow-inner border border-[#23262c]/50">
          <div 
            className="h-full rounded-full relative transition-all duration-1000 ease-out"
            style={{ 
              width: `${widthPercentage}%`, 
              backgroundColor: colorHex,
              boxShadow: `0 0 10px ${colorHex}40`
            }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-pulse blur-[2px]"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f6f6fc] font-sans overflow-x-hidden selection:bg-[#ac89ff]/40">
      
      {/* Top Header / Neural Observatory Glass */}
      <div className="sticky top-0 z-50 border-b border-[#46484d]/20 bg-[#1d2025]/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiHealthy ? 'bg-[#f3ffca]' : 'bg-[#ff716c]'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${apiHealthy ? 'bg-[#cafd00]' : 'bg-[#d7383b]'}`}></span>
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81ecff] to-[#00d4ec]">
                Neural Observatory
              </span>
            </h1>
            <p className="text-[#aaabb0] text-[12px] font-mono tracking-widest uppercase mt-1">Multi-Model RAG Validation Matrices</p>
          </div>
          
          <div className="flex bg-[#111318] border border-[#46484d]/30 rounded-xl px-4 py-2 shadow-inner">
            <span className="text-[#aaabb0] text-[11px] font-mono uppercase tracking-widest mr-3 flex items-center">Backend Health:</span>
            <span className={`text-[12px] font-mono font-bold ${apiHealthy ? 'text-[#00e3fd] drop-shadow-[0_0_5px_rgba(0,227,253,0.5)]' : 'text-[#ff716c]'}`}>
              {apiHealthy ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Input Execution Panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-[#23262c]/60 backdrop-blur-lg border border-[#46484d]/20 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00d4ec] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
            
            <h2 className="text-[#f6f6fc] text-lg font-semibold tracking-wide mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>New Evaluation</h2>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#aaabb0] mb-2">Primary Prompt</label>
                <textarea
                  className="w-full bg-[#000000] border border-[#46484d]/40 rounded-xl p-4 text-[13px] text-[#f6f6fc] placeholder-[#53555a] focus:border-[#81ecff] focus:ring-1 focus:ring-[#81ecff] outline-none resize-y min-h-[100px] shadow-inner font-mono custom-scrollbar transition-all"
                  placeholder="Enter the query..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#aaabb0] mb-2">Model 1 Output</label>
                <textarea
                  className="w-full bg-[#000000] border border-[#46484d]/40 rounded-xl p-4 text-[13px] text-[#f6f6fc] placeholder-[#53555a] focus:border-[#ac89ff] focus:ring-1 focus:ring-[#ac89ff] outline-none resize-y min-h-[100px] shadow-inner font-mono custom-scrollbar transition-all"
                  placeholder="Paste response..."
                  value={claudeResponse}
                  onChange={e => setClaudeResponse(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#aaabb0] mb-2">Model 2 Output</label>
                <textarea
                  className="w-full bg-[#000000] border border-[#46484d]/40 rounded-xl p-4 text-[13px] text-[#f6f6fc] placeholder-[#53555a] focus:border-[#cafd00] focus:ring-1 focus:ring-[#cafd00] outline-none resize-y min-h-[100px] shadow-inner font-mono custom-scrollbar transition-all"
                  placeholder="Paste response..."
                  value={openaiResponse}
                  onChange={e => setOpenaiResponse(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#aaabb0] mb-2">Judge Binding</label>
                <input
                  className="w-full bg-[#000000] border border-[#46484d]/40 rounded-xl p-3 text-[13px] text-[#f6f6fc] focus:border-[#81ecff] outline-none shadow-inner font-mono transition-all"
                  value={judgeModel}
                  onChange={e => setJudgeModel(e.target.value)}
                  placeholder="ollama/llama3"
                />
              </div>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={loading || !apiHealthy}
              className={`w-full mt-8 py-3.5 rounded-xl text-[14px] font-bold font-mono tracking-wider transition-all duration-300 relative overflow-hidden group ${
                loading || !apiHealthy 
                ? "bg-[#111318] text-[#53555a] cursor-not-allowed border-none" 
                : "bg-gradient-to-br from-[#81ecff] to-[#00d4ec] text-[#003840] hover:shadow-[0_0_20px_rgba(0,227,253,0.4)] border-none"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-4 w-4 text-[#003840]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Processing Matrices...</span>
                </div>
              ) : "Execute Analytics"}
            </button>
            
            {apiError && (
              <div className="mt-4 p-3 rounded-xl bg-[#9f0519]/20 border border-[#d7383b]/50 text-[#ff716c] text-[12px] font-mono">
                {apiError}
              </div>
            )}
          </div>
        </div>

        {/* History / Data View Panel */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#f6f6fc] text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Execution Registry
            </h2>
            <span className="text-[#aaabb0] font-mono text-[11px] bg-[#1d2025] px-3 py-1 rounded-full border border-[#46484d]/30">
              {history.length} Logs Bound
            </span>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#46484d]/40 rounded-2xl bg-[#111318]/50">
              <span className="text-[#53555a] font-mono text-[13px] tracking-widest uppercase">Registry Empty</span>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {history.map((record) => (
                <div key={record.id} className="bg-[#1d2025]/50 border border-[#46484d]/30 rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 duration-300">
                  
                  {/* Record Header */}
                  <div className="bg-[#111318] px-6 py-4 border-b border-[#46484d]/30 flex justify-between items-center">
                    <span className="text-[12px] font-mono text-[#00d4ec] tracking-widest uppercase">ID: {record.id.split('-')[0]}</span>
                    <span className="text-[11px] font-mono text-[#aaabb0]">{new Date(record.timestamp).toLocaleString()}</span>
                  </div>

                  {/* Prompt Banner */}
                  <div className="px-6 py-5 bg-gradient-to-r from-[#23262c] to-[#111318] border-b border-[#46484d]/10">
                    <div className="flex gap-4">
                      <div className="mt-1 w-2 h-2 rounded-full bg-[#f6f6fc] opacity-50 shrink-0"></div>
                      <div>
                        <p className="text-[10px] font-mono text-[#aaabb0] uppercase tracking-widest mb-1.5">Context Prompt</p>
                        <p className="text-[14px] text-[#f6f6fc] leading-relaxed opacity-90">{record.prompt}</p>
                      </div>
                    </div>
                  </div>

                  {/* Model Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#46484d]/20">
                    
                    {/* Model 1 */}
                    <div className="bg-[#1d2025] flex flex-col relative group">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-[#ac89ff] opacity-40"></div>
                      <div className="p-6 grow flex flex-col gap-6">
                        <div>
                          <p className="text-[10px] items-center flex gap-2 font-mono text-[#ac89ff] uppercase tracking-widest mb-3">
                            <span className="px-1.5 py-0.5 bg-[#ac89ff]/10 rounded border border-[#ac89ff]/20">M1</span> 
                            Model 1 Extracted Logic
                          </p>
                          <div className="bg-[#0c0e12] border border-[#23262c] rounded-xl p-4 text-[13px] text-[#aaabb0] max-h-40 overflow-y-auto custom-scrollbar">
                            {record.responses['1st_model'] || "N/A"}
                          </div>
                        </div>

                        {record.evaluations['1st_model']?.scores && (
                          <div className="mt-auto">
                            <MetricBar label="Faithfulness" value={record.evaluations['1st_model'].scores.faithfulness} colorHex="#81ecff" />
                            <MetricBar label="Relevance" value={record.evaluations['1st_model'].scores.relevance} colorHex="#cafd00" />
                            <MetricBar label="Precision" value={record.evaluations['1st_model'].scores.precision} colorHex="#ac89ff" />
                            <MetricBar label="Toxicity" value={record.evaluations['1st_model'].scores.toxicity} colorHex="#ff716c" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Model 2 */}
                    <div className="bg-[#1d2025] flex flex-col relative group">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-[#cafd00] opacity-40"></div>
                      <div className="p-6 grow flex flex-col gap-6">
                        <div>
                          <p className="text-[10px] items-center flex gap-2 font-mono text-[#cafd00] uppercase tracking-widest mb-3">
                            <span className="px-1.5 py-0.5 bg-[#cafd00]/10 rounded border border-[#cafd00]/20">M2</span> 
                            Model 2 Extracted Logic
                          </p>
                          <div className="bg-[#0c0e12] border border-[#23262c] rounded-xl p-4 text-[13px] text-[#aaabb0] max-h-40 overflow-y-auto custom-scrollbar">
                            {record.responses['2nd_model'] || "N/A"}
                          </div>
                        </div>

                        {record.evaluations['2nd_model']?.scores && (
                          <div className="mt-auto">
                            <MetricBar label="Faithfulness" value={record.evaluations['2nd_model'].scores.faithfulness} colorHex="#81ecff" />
                            <MetricBar label="Relevance" value={record.evaluations['2nd_model'].scores.relevance} colorHex="#cafd00" />
                            <MetricBar label="Precision" value={record.evaluations['2nd_model'].scores.precision} colorHex="#ac89ff" />
                            <MetricBar label="Toxicity" value={record.evaluations['2nd_model'].scores.toxicity} colorHex="#ff716c" />
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                  
                  {/* Reasoning Footer */}
                  {record.evaluations['1st_model']?.reasons && (
                    <div className="bg-[#111318] p-5 border-t border-[#46484d]/20 flex gap-3 items-start">
                      <div className="text-[16px] mt-0.5">💡</div>
                      <div>
                         <p className="text-[10px] font-mono text-[#53555a] uppercase tracking-widest mb-1.5">Universal Judge Reasoning (Model 1 Example)</p>
                         <p className="text-[12px] text-[#aaabb0] leading-relaxed italic">
                           Faithfulness: {record.evaluations['1st_model'].reasons.faithfulness}
                         </p>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #46484d; border-radius: 4px; opacity: 0.5; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #53555a; }
      `}</style>
    </div>
  )
}

export default App
