import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getCalls } from "../lib/api";
import { FiClock, FiPhone, FiSearch, FiAlertCircle, FiLoader, FiChevronRight } from "react-icons/fi";

function Home() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCalls() {
      try {
        const data = await getCalls();
        setCalls(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load calls");
      } finally {
        setLoading(false);
      }
    }

    loadCalls();
  }, []);

  const filteredCalls = useMemo(() => {
    return calls.filter((call) =>
      call.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [calls, searchQuery]);

  const totalDuration = useMemo(() => {
    return calls.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  }, [calls]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0s";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-white selection:text-black">

      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">

        {/* Header */}
        <header className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>

            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2m7 9v4m-4 0h8"
                  />
                </svg>
              </div>

              <span className="text-lg font-bold tracking-tight text-white">
                Vaami Voice
              </span>
            </div>

            {/* Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono mb-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Live Dashboard
            </div>

            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Voice Activity
            </h1>

            <p className="text-zinc-400 mt-1 text-sm sm:text-base font-normal">
              Monitor and analyze your AI voice conversations
            </p>

          </div>

          {/* Start Call */}
          <Link
            to="/call"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm"
          >
            <FiPhone className="w-4 h-4" />
            Start New Call
          </Link>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-4 shadow-xl">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Total Calls
            </p>

            <p className="text-2xl font-bold font-mono text-white mt-1">
              {calls.length}
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-4 shadow-xl">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Total Duration
            </p>

            <p className="text-2xl font-bold font-mono text-white mt-1">
              {formatDuration(totalDuration)}
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-4 shadow-xl">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              System Status
            </p>

            <p className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              Operational
            </p>
          </div>

        </div>

        {/* Search */}
        <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 rounded-2xl p-3 shadow-xl">

          <div className="relative w-full">

            <FiSearch className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />

            <input
              type="text"
              placeholder="Search call ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all font-mono"
            />

          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-12 text-center shadow-2xl">

            <FiLoader className="inline-block animate-spin w-8 h-8 text-white mb-3" />

            <p className="text-zinc-300 font-medium text-sm">
              Loading call logs...
            </p>

          </div>
        )}

        {/* Error */}
        {error && (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/20 text-zinc-200 rounded-3xl p-6 font-medium shadow-2xl flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCalls.length === 0 && (
          <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl p-12 text-center shadow-2xl">

            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400">
              <FiPhone className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white">
              {calls.length === 0
                ? "No calls yet"
                : "No matching calls found"}
            </h2>

            <p className="text-zinc-400 mt-1 text-sm">
              {calls.length === 0
                ? "Your completed AI voice calls will appear here."
                : "Try adjusting your search filter."}
            </p>

          </div>
        )}

        {/* Recent Calls Header */}
        {!loading && filteredCalls.length > 0 && (
          <div className="flex items-center justify-between px-1 pt-2">

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Recent Calls
              </h2>

              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                {filteredCalls.length}{" "}
                {filteredCalls.length === 1 ? "conversation" : "conversations"}
              </p>
            </div>

          </div>
        )}

        {/* Call List */}
        <div className="space-y-3  h-[300px]  overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {filteredCalls.map((call) => (
            <Link
              key={call.id}
              to={`/calls/${call.id}`}
              className="group block  backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/30 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
            >

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Call Info */}
                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-xl bg-white/10 group-hover:bg-white group-hover:text-black border border-white/10 text-white flex items-center justify-center transition-colors duration-300 shrink-0">
                    <FiPhone className="w-5 h-5" />
                  </div>

                  <div>

                    <h2 className="font-semibold text-base sm:text-lg font-mono text-white group-hover:text-zinc-200 transition-colors break-all">
                      {call.id}
                    </h2>

                    <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                      {new Date(call.start_time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                  </div>

                </div>

                {/* Duration */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">

                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/10 text-zinc-200 border border-white/10">
                    <FiClock className="mr-1.5 h-3.5 w-3.5" /> {formatDuration(call.duration)}
                  </span>

                  <span className="text-xs text-zinc-400 font-medium sm:mt-2 group-hover:text-white group-hover:translate-x-1 transition-all inline-flex items-center gap-1">
                    View details
                    <FiChevronRight className="w-4 h-4" />
                  </span>

                </div>

              </div>

            </Link>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Home;