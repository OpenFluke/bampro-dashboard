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
    };
  }

  componentDidMount() {
    const isDev = process.env.REACT_APP_ENV === "development";
    if (isDev) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css";
      document.head.appendChild(link);
      this.bulmaLink = link;
    }
  }

  componentWillUnmount() {
    if (this.bulmaLink) {
      document.head.removeChild(this.bulmaLink);
    }
  }

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
            className="box"
            style={{
              height: "100%", // Fixed height instead of minHeight
              width: "100%",
              overflowY: "auto",
              position: "relative", // For absolute positioning of children
            }}
          >
            <div
              style={{
                display: activePanel === "status" ? "block" : "none",
              }}
            >
              <StatusPanel widgets={widgets} addWidget={this.addWidget} />
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
              <ReportPanel />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
