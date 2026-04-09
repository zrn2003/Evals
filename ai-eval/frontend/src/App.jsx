import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || "test_key";

function App() {
  const [prompt, setPrompt] = useState("");
  const [claudeResponse, setClaudeResponse] = useState("");
  const [openaiResponse, setOpenaiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [apiError, setApiError] = useState("");
  const [judgeModel, setJudgeModel] = useState("llama3");
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

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 5) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const Badge = ({ score, isLength = false }) => {
    const safeScore = score !== undefined && score !== null ? Number(score) : 0;

    if (isLength) {
      return (
        <div className="px-2 py-0.5 rounded border text-xs font-mono inline-flex items-center justify-center min-w-[3.5rem] shadow-sm bg-slate-50 text-slate-600 border-slate-200">
          {safeScore}
        </div>
      );
    }

    return (
      <div className={`px-2 py-0.5 rounded border text-xs font-mono inline-flex items-center justify-center min-w-[3.5rem] shadow-sm ${getScoreColor(safeScore)}`}>
        {safeScore.toFixed(2)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 w-full overflow-x-hidden pb-20">

      {/* Top Input Section */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]"></span>
              AI Evaluation Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Compare two AI model responses for the same prompt using local Ollama as judge.
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className={`px-2 py-1 rounded border ${apiHealthy ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                API: {apiHealthy ? "Connected" : "Disconnected"}
              </span>
              <span className="text-slate-500">Saved evaluations: {history.length}</span>
            </div>
          </div>

          {/* Main inputs */}
          <div className="grid grid-cols-1 gap-8">
            <div className="lg:col-span-1">
              <label className="flex items-center text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide font-mono">
                Primary Prompt
              </label>
              <textarea
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 text-slate-900 placeholder-slate-400 outline-none resize-y text-sm font-mono leading-relaxed custom-scrollbar shadow-sm"
                rows={4}
                placeholder="Enter the prompt you want to evaluate..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <div className="mt-4 flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-600 font-mono">
                  Judge model
                </label>
                <input
                  value={judgeModel}
                  onChange={(e) => setJudgeModel(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-blue-500/60 outline-none"
                  placeholder="llama3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="flex items-center text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide font-mono">
                    1st AI Model Response
                  </label>
                  <textarea
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500 text-slate-900 placeholder-slate-400 outline-none resize-y text-sm font-mono leading-relaxed custom-scrollbar shadow-sm"
                    rows={6}
                    placeholder="Paste response..."
                    value={claudeResponse}
                    onChange={e => setClaudeResponse(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="flex items-center text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide font-mono">
                    2nd AI Model Response
                  </label>
                  <textarea
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 text-slate-900 placeholder-slate-400 outline-none resize-y text-sm font-mono leading-relaxed custom-scrollbar shadow-sm mb-4 flex-grow"
                    rows={6}
                    placeholder="Paste response..."
                    value={openaiResponse}
                    onChange={e => setOpenaiResponse(e.target.value)}
                  />
                  <button
                    onClick={handleEvaluate}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 border border-blue-500/70 shadow-sm ${loading ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                      }`}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : "Run Evals"}
                  </button>
                  {apiError && (
                    <div className="mt-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
                      {apiError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="w-full max-w-none mx-auto overflow-x-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">
        <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white shadow-md custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 w-[20%] border-r border-slate-200 font-medium">Inputs</th>
                <th className="p-4 w-[8%] border-r border-slate-200 font-medium">Model</th>
                <th className="p-4 w-[25%] border-r border-slate-200 font-medium">Model Output</th>
                <th className="p-4 w-[23%] border-r border-slate-200 font-medium text-blue-600">LLM-as-judge Outputs</th>
                <th className="p-4 w-[8%] border-r border-slate-200 text-center font-medium">Relevance</th>
                <th className="p-4 w-[8%] border-r border-slate-200 text-center font-medium">Completeness</th>
                <th className="p-4 w-[8%] text-center font-medium">Token Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top text-sm">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-500 text-lg font-mono">No evaluations yet. Run one above to see results.</td>
                </tr>
              ) : history.map((record, recordIndex) => {
                const models = [
                  { key: '1st_model', name: '1st Model', data: record.responses['1st_model'], evals: record.evaluations['1st_model'], color: 'text-purple-400' },
                  { key: '2nd_model', name: '2nd Model', data: record.responses['2nd_model'], evals: record.evaluations['2nd_model'], color: 'text-emerald-400' }
                ];

                return models.map((model, index) => {
                  if (!model.evals) return null; // Safety check

                  const isFirstRow = index === 0;
                  // Add a thicker border to separate different records
                  const groupBorder = recordIndex !== history.length - 1 && index === 1 ? 'border-b-4 border-slate-200' : '';

                  return (
                    <tr key={`${record.id}-${model.key}`} className={`hover:bg-slate-50 transition-colors ${groupBorder}`}>
                      {isFirstRow && (
                        <td rowSpan={2} className="p-4 border-r border-slate-200 align-top bg-white">
                          <div className="flex items-center text-slate-500 text-[11px] font-mono mb-3 font-bold uppercase tracking-wider">
                            <span className="mr-2">⌄</span> Question
                          </div>
                          <div className="text-slate-900 leading-relaxed whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto custom-scrollbar pr-2 text-[14px]">
                            {record.prompt}
                          </div>
                          <div className="mt-6 text-slate-400 text-[10px] font-mono tracking-wider">
                            EVAL: {record.id.split('-')[0]} • {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                      )}

                      <td className="p-4 border-r border-slate-200 align-top pt-6">
                        <div className="inline-block"><span className={`font-mono text-xs font-semibold px-2 py-1 rounded-md bg-slate-50 border border-slate-200 ${model.color.replace('text-', 'text-')} whitespace-nowrap`}>{model.name}</span></div>
                      </td>

                      <td className="p-4 border-r border-slate-200 align-top">
                        <div className="flex items-center text-slate-500 text-[11px] font-mono mb-3 font-bold uppercase tracking-wider">
                          <span className="mr-2">⌄</span> LLM Output
                        </div>
                        <div className="text-slate-800 leading-relaxed whitespace-pre-wrap break-words w-full max-h-48 overflow-y-auto custom-scrollbar pr-2 text-[14px]">
                          {model.data || "No response."}
                        </div>
                      </td>

                      {isFirstRow && (
                        <td rowSpan={2} className="p-4 border-r border-slate-200 bg-slate-50 align-top">
                          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center">
                            <span className="mr-2">⚖️</span> Evaluator Reasoning
                          </div>
                          <div className="text-[13px] text-slate-700 italic whitespace-pre-wrap break-words w-full max-h-[400px] overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
                            "{record.evaluations.overall_reasoning || "No reasoning attached."}"
                          </div>
                        </td>
                      )}

                      <td className="p-4 border-r border-slate-200 text-center align-middle pt-6">
                        <Badge score={model.evals.relevance} />
                      </td>
                      <td className="p-4 border-r border-slate-200 text-center align-middle pt-6">
                        <Badge score={model.evals.completeness} />
                      </td>
                      <td className="p-4 text-center align-middle pt-6">
                        <Badge score={model.evals.token_length} isLength={true} />
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272A; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3F3F46; }
      `}</style>
    </div>
  )
}

export default App
