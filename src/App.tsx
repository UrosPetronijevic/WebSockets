import { useState, useRef } from "react";

export default function App() {
  const [clientId, setClientId] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]); // ✅ Message history
  const [isConnected, setIsConnected] = useState<boolean>(false); // ✅ Connection state
  const [msg, setMsg] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null); // ✅ Ref avoids stale closure
  const [recipient, setRecipient] = useState<string>(""); // ✅ NEW: Who to send TO

  const handleConnect = () => {
    if (!clientId.trim()) return alert("Enter your name!");

    const ws = new WebSocket(`ws://localhost:3000/?userId=${clientId.trim()}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected!");
      setIsConnected(true);
      setMessages((prev) => [...prev, `Welcome: ${clientId}!`]); // Show welcome
    };

    ws.onmessage = (event) => {
      const received = event.data;
      console.log("📨 Received:", received);
      setMessages((prev) => [...prev, received]); // ✅ Add to UI
    };

    ws.onclose = () => {
      console.log("🔌 Disconnected");
      setIsConnected(false);
      setMessages((prev) => [...prev, "Disconnected from server"]);
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      setMessages((prev) => [...prev, "Connection error!"]);
    };
  };

  const handleSend = () => {
    if (!isConnected || !msg.trim() || !recipient.trim() || !wsRef.current)
      return;

    const payload = { to: recipient.trim(), text: msg.trim() }; // ✅ DYNAMIC to!
    wsRef.current.send(JSON.stringify(payload));
    console.log(`📤 ${clientId} → ${recipient}:`, payload);
    setMsg(""); // Clear msg only
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">WebSocket Chat Demo</h1>

      <div className="p-8 w-full max-w-md bg-white border-2 border-gray-300 rounded-lg shadow-lg">
        {/* Connect Section */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Your name (e.g., alice)"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleConnect}
            disabled={isConnected}
            className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-semibold"
          >
            {isConnected ? "Connected!" : "Connect to Server"}
          </button>
        </div>

        {/* Chat Section */}
        {isConnected && (
          <>
            <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className="text-sm mb-1 whitespace-pre-wrap">
                  {m}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Type message ..."
                className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />

              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Send to (to who)"
                className="w-full p-3 border-2 ..."
              />
              <button
                onClick={handleSend}
                disabled={!isConnected || !msg.trim()}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Open 2 tabs: Tab1=alice, Tab2=bob. Send from alice → bob sees it!
      </p>
    </div>
  );
}
