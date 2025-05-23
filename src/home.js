import React from "react";
import AdminKey from "./AdminKey";
import StatusPanel from "./StatusPanel";
import ControlPanel from "./ControlPanel";
import ReportPanel from "./ReportPanel";

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    const widgets = JSON.parse(localStorage.getItem("widgetLayout") || "[]");
    const isAdmin = sessionStorage.getItem("isAdmin") === "yes";

    this.state = {
      activePanel: "status",
      isAdmin,
      running: false,
      settings: { epochs: 10 },
      widgets,
      runningUpdates: [],
      scores: [],
    };
  }

  componentDidMount() {
    // ✅ Inject Bulma dynamically in development
    const isDev = process.env.REACT_APP_ENV === "development";
    if (isDev) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css";
      document.head.appendChild(link);
      this.bulmaLink = link;
    }

    // ✅ WebSocket URL targeting :9001 (same for dev and prod)
    const wsUrl = `ws://${window.location.hostname}:9001/ws/status`;
    this.socket = new WebSocket(wsUrl);

    // ✅ Handle WebSocket connection events
    this.socket.onopen = () => {
      console.log("✅ WebSocket connected to", wsUrl);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // ✅ Ensure message has a type
        if (!message.type || !message.data) {
          console.warn("⚠️ Unrecognized WS message:", message);
          return;
        }

        switch (message.type) {
          case "status_update":
            this.setState({ status: message.data });
            break;
          case "experiment_config":
            this.setState({ settings: message.data });
            break;
          case "heartbeat":
            console.log("💓 Server ping:", message.data.message);
            break;
          case "running_update":
            this.setState((prev) => ({
              runningUpdates: [...(prev.runningUpdates || []), ...message.data],
            }));
            break;

          case "scores_overview":
            this.setState({ scores: message.data });
            break;

          default:
            console.log("📦 Unknown message type received:", message.type);
        }
      } catch (err) {
        console.warn("❌ Failed to parse WebSocket message:", event.data);
      }
    };

    this.socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    this.socket.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
    };
  }

  componentWillUnmount() {
    if (this.bulmaLink) {
      document.head.removeChild(this.bulmaLink);
    }

    if (this.socket) {
      this.socket.close();
    }
  }

  sendControlMessage = (action, payload) => {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not connected, cannot send:", action);
      return;
    }

    const message = {
      type: "experiment_control",
      data: {
        action,
        payload,
      },
    };

    this.socket.send(JSON.stringify(message));
  };

  handleLogin = (password) => {
    if (password === "letmein") {
      sessionStorage.setItem("isAdmin", "yes");
      this.setState({ isAdmin: true });
      console.log(
        "Login successful, sessionStorage set:",
        sessionStorage.getItem("isAdmin")
      );
      return true;
    }
    return false;
  };

  handleLogout = () => {
    console.log(
      "Before logout, sessionStorage:",
      sessionStorage.getItem("isAdmin")
    );
    sessionStorage.removeItem("isAdmin");
    this.setState({ isAdmin: false }, () => {
      console.log(
        "After logout, sessionStorage:",
        sessionStorage.getItem("isAdmin")
      );
      console.log("State after logout:", this.state.isAdmin);
    });
  };

  switchPanel = (panel) => this.setState({ activePanel: panel });

  addWidget = () => {
    const widget = {
      id: Date.now(),
      title: `Widget ${this.state.widgets.length + 1}`,
    };
    const widgets = [...this.state.widgets, widget];
    this.setState({ widgets }, () =>
      localStorage.setItem("widgetLayout", JSON.stringify(this.state.widgets))
    );
  };

  runExp = () => this.setState({ running: true });
  stopExp = () => this.setState({ running: false });
  handleSettingChange = (e) =>
    this.setState({
      settings: { ...this.state.settings, [e.target.name]: e.target.value },
    });

  render() {
    const { activePanel, isAdmin, running, widgets, settings } = this.state;

    return (
      <div className="container is-fluid has-background-black-ter">
        <div
          className="box has-background-black-ter"
          style={{ padding: "1.5rem", boxShadow: "none" }}
        >
          <div className="buttons block">
            <button
              className={`button ${
                activePanel === "status" ? "is-primary" : "is-dark"
              }`}
              onClick={() => this.switchPanel("status")}
            >
              Status
            </button>
            <button
              className={`button ${
                activePanel === "control" ? "is-primary" : "is-dark"
              }`}
              onClick={() => this.switchPanel("control")}
            >
              Control
            </button>
            <button
              className={`button ${
                activePanel === "report" ? "is-primary" : "is-dark"
              }`}
              onClick={() => this.switchPanel("report")}
            >
              Report
            </button>

            <div className="block">
              <AdminKey
                isAdmin={isAdmin}
                onLogin={this.handleLogin}
                onLogout={this.handleLogout}
              />
            </div>
          </div>

          <div
            className="box has-background-black-ter"
            style={{
              height: "100%", // Fixed height instead of minHeight
              width: "100%",
              overflowY: "auto",
              position: "relative", // For absolute positioning of children
            }}
          >
            <div
              className="has-background-black-ter"
              style={{
                display: activePanel === "status" ? "block" : "none",
              }}
            >
              {activePanel === "status" && (
                <StatusPanel
                  status={this.state.status}
                  updates={this.state.runningUpdates}
                  scores={this.state.scores}
                  ws={this.socket}
                />
              )}
            </div>
            <div
              style={{
                display: activePanel === "control" ? "block" : "none",

                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                overflowY: "auto",
              }}
            >
              <ControlPanel
                isAdmin={isAdmin}
                running={running}
                settings={settings}
                onRun={this.runExp}
                onStop={this.stopExp}
                onSettingChange={this.handleSettingChange}
                sendControlMessage={this.sendControlMessage}
              />
            </div>
            <div
              style={{
                display: activePanel === "report" ? "block" : "none",

                top: 0,
                left: 0,
                width: "100%",

                overflowY: "auto",
              }}
            >
              <ReportPanel
                status={this.state.status}
                scores={this.state.scores}
                updates={this.state.runningUpdates}
                settings={this.state.settings}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
