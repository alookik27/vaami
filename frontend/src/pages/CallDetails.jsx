import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiHash,
  FiUser,
  FiActivity,
  FiAlertCircle,
  FiLoader,
  FiMessageSquare,
  FiAirplay,
  FiTrash2,
} from "react-icons/fi";

import { getCall, deleteCall } from "../lib/api";


function CallDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this call and all its data? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await deleteCall(id);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Failed to delete call.");
      setDeleting(false);
    }
  }

  useEffect(() => {
    async function loadCall() {
      try {
        const data = await getCall(id);
        setCall(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load call details.");
      } finally {
        setLoading(false);
      }
    }

    loadCall();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex items-center space-x-3 text-zinc-300 relative z-10 bg-white/[0.03] border border-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl">
          <FiLoader className="h-5 w-5 animate-spin text-white" />
          <span className="text-sm font-medium tracking-wide">Loading call details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-6 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex max-w-md items-center space-x-3 rounded-2xl border border-white/20 bg-white/[0.05] backdrop-blur-xl p-5 text-zinc-200 shadow-2xl relative z-10">
          <FiAlertCircle className="h-6 w-6 flex-shrink-0 text-white" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="text-center relative z-10 bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 rounded-3xl max-w-sm w-full shadow-2xl">
          <FiAlertCircle className="mx-auto h-10 w-10 text-zinc-500" />
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">Call Not Found</h3>
          <p className="mt-1 text-xs text-zinc-400">The requested call session could not be located.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center space-x-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Back to calls</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-10 font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background Lighting Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10">

        {/* Back Button + Delete */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-zinc-400 transition-colors hover:text-white"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Back to calls</span>
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 text-xs font-semibold hover:bg-red-900/60 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <FiLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FiTrash2 className="h-3.5 w-3.5" />
            )}
            {deleting ? "Deleting..." : "Delete Call"}
          </button>
        </div>

        {/* Header & Overview Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Call Overview
          </h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="flex items-start space-x-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 backdrop-blur-md">
              <div className="rounded-xl bg-white/10 p-2.5 text-white">
                <FiHash className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Call ID</p>
                <p className="mt-1 text-sm font-semibold font-mono text-white break-all">
                  {call.id}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 backdrop-blur-md">
              <div className="rounded-xl bg-white/10 p-2.5 text-white">
                <FiClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Duration</p>
                <p className="mt-1 text-sm font-semibold font-mono text-white">
                  {call.duration ?? 0}s
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 backdrop-blur-md">
              <div className="rounded-xl bg-white/10 p-2.5 text-white">
                <FiCalendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Started</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {call.start_time
                    ? new Date(call.start_time).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
            <FiMessageSquare className="h-5 w-5 text-zinc-400" />
            <h2 className="text-base font-semibold tracking-tight text-white">Transcript</h2>
          </div>

          {call.transcripts?.length > 0 ? (
            <div className="mt-6 space-y-4">
              {call.transcripts.map((message, index) => {
                const isUser = message.speaker?.toLowerCase() === "user";
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${
                      isUser ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium backdrop-blur-md ${
                        isUser
                          ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                          : "bg-white/10 text-white border border-white/10"
                      }`}
                    >
                      {isUser ? <FiUser className="h-4 w-4" /> : <FiAirplay className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-md ${
                        isUser
                          ? "bg-white text-black font-medium rounded-br-none shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                          : "bg-white/5 text-zinc-200 border border-white/10 rounded-bl-none"
                      }`}
                    >
                      <p
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                          isUser ? "text-zinc-500" : "text-zinc-400"
                        }`}
                      >
                        {message.speaker}
                      </p>
                      <p>{message.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl mt-6 bg-white/[0.01]">
              <p className="text-xs font-mono">No transcript available for this call.</p>
            </div>
          )}
        </div>

        {/* Metrics Section */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
            <FiActivity className="h-5 w-5 text-zinc-400" />
            <h2 className="text-base font-semibold tracking-tight text-white">Latency Metrics</h2>
          </div>

       
            <div className="py-12 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl mt-6 bg-white/[0.01]">
              <p className="text-xs font-mono">No latency metrics recorded.</p>
            </div>
   
        </div>

      </div>
    </div>
  );
}


export default CallDetails;