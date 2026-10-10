import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { QrCode, Smartphone, Check, Copy, Wifi, Edit3 } from "lucide-react";

export default function QRCodeCard({ roomCode, size = 160, showDetails = true }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [lanIp, setLanIp] = useState("");
  const [port, setPort] = useState(4000);
  const [overrideHost, setOverrideHost] = useState(localStorage.getItem("aptiquiz_lan_override") || "");
  const [editingIp, setEditingIp] = useState(false);
  const [customIpInput, setCustomIpInput] = useState("");

  // Fetch local LAN IP from server
  useEffect(() => {
    fetch("/api/server-info")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip && data.ip !== "localhost") {
          setLanIp(data.ip);
          setPort(data.port || 4000);
        }
      })
      .catch((err) => console.log("Could not detect LAN IP automatically:", err.message));
  }, []);

  // Compute actual join URL for phone
  // If user provided overrideHost -> use it
  // If on localhost and lanIp is detected -> use http://<lanIp>:<port> so phones on Wi-Fi can reach the laptop!
  // If already on a real domain or network IP -> use window.location.origin
  const isLocalhost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  
  let targetOrigin = "";
  if (overrideHost) {
    targetOrigin = overrideHost.startsWith("http") ? overrideHost : `http://${overrideHost}`;
  } else if (isLocalhost && lanIp) {
    targetOrigin = `http://${lanIp}:${port}`;
  } else if (typeof window !== "undefined") {
    targetOrigin = window.location.origin;
  } else {
    targetOrigin = "http://localhost:4000";
  }

  const joinUrl = `${targetOrigin}/?room=${roomCode}`;

  useEffect(() => {
    if (!roomCode) return;
    QRCode.toDataURL(joinUrl, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#07090e",
        light: "#ffffff"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [joinUrl, roomCode, size]);

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomIp = (e) => {
    e?.preventDefault();
    const clean = customIpInput.trim();
    setOverrideHost(clean);
    if (clean) {
      localStorage.setItem("aptiquiz_lan_override", clean);
    } else {
      localStorage.removeItem("aptiquiz_lan_override");
    }
    setEditingIp(false);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "rgba(15, 23, 42, 0.75)",
      border: "1px solid rgba(99, 102, 241, 0.3)",
      borderRadius: "var(--radius-lg)",
      padding: "16px 20px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      maxWidth: "320px"
    }}>
      {/* QR Code Container */}
      <div style={{
        background: "#ffffff",
        padding: "10px",
        borderRadius: "14px",
        boxShadow: "0 0 25px rgba(99, 102, 241, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Scan QR Code to Join Room ${roomCode}`}
            style={{ width: `${size}px`, height: `${size}px`, display: "block" }}
          />
        ) : (
          <div style={{
            width: `${size}px`,
            height: `${size}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b"
          }}>
            <QrCode size={size * 0.4} />
          </div>
        )}
      </div>

      {showDetails && (
        <div style={{ marginTop: "12px", textAlign: "center", width: "100%" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "0.85rem",
            fontWeight: "700",
            color: "var(--secondary)",
            marginBottom: "4px"
          }}>
            <Smartphone size={14} /> Scan with Phone Camera
          </div>

          <div style={{
            fontSize: "0.74rem",
            color: "#94a3b8",
            wordBreak: "break-all",
            background: "rgba(0, 0, 0, 0.3)",
            padding: "6px 8px",
            borderRadius: "6px",
            fontFamily: "var(--font-mono)",
            marginTop: "6px",
            marginBottom: "6px"
          }}>
            {joinUrl}
          </div>

          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", marginTop: "6px" }}>
            <button
              onClick={copyLink}
              className="btn btn-secondary btn-sm"
              style={{
                padding: "4px 10px",
                fontSize: "0.72rem",
                borderRadius: "var(--radius-full)"
              }}
            >
              {copied ? <><Check size={11} color="var(--accent-emerald)" /> Copied</> : <><Copy size={11} /> Copy Phone Link</>}
            </button>

            <button
              onClick={() => {
                setCustomIpInput(overrideHost || (lanIp ? `${lanIp}:${port}` : ""));
                setEditingIp(!editingIp);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                padding: "4px 8px",
                fontSize: "0.72rem",
                borderRadius: "var(--radius-full)",
                color: "var(--text-muted)"
              }}
              title="Change Wi-Fi IP / Mobile Hotspot IP"
            >
              <Wifi size={11} /> Change IP
            </button>
          </div>

          {/* Inline IP editor if user switched to mobile hotspot or tunnel */}
          {editingIp && (
            <form onSubmit={handleSaveCustomIp} style={{ marginTop: "10px", textAlign: "left" }}>
              <label style={{ fontSize: "0.7rem", color: "var(--text-dim)", display: "block", marginBottom: "4px" }}>
                Wi-Fi IP or Mobile Hotspot IP (e.g. 192.168.1.5:4000)
              </label>
              <div style={{ display: "flex", gap: "4px" }}>
                <input
                  type="text"
                  value={customIpInput}
                  onChange={(e) => setCustomIpInput(e.target.value)}
                  placeholder="e.g. 192.168.1.10:4000"
                  className="input-field"
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
