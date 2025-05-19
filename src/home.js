import React from "react";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      isAdmin: false,
      running: false,
      error: "",
    };
  }

  handleInputChange = (e) => {
    this.setState({ password: e.target.value, error: "" });
  };

  handleLogin = (e) => {
    e.preventDefault();
    // For demo: hardcoded password is "letmein"
    if (this.state.password === "letmein") {
      this.setState({ isAdmin: true, error: "" });
    } else {
      this.setState({ error: "Invalid password!" });
    }
  };

  handleRun = () => {
    this.setState({ running: true });
    // TODO: trigger backend "run" experiment via API/WebSocket
  };

  handleStop = () => {
    this.setState({ running: false });
    // TODO: trigger backend "stop" experiment via API/WebSocket
  };

  render() {
    const { password, isAdmin, running, error } = this.state;
    return (
      <div className="section">
        <div className="container">
          <h2 className="title is-3 has-text-centered">Experiment Dashboard</h2>
          {!isAdmin ? (
            <form
              className="box"
              style={{ maxWidth: 360, margin: "2rem auto" }}
              onSubmit={this.handleLogin}
            >
              <div className="field">
                <label className="label">Admin Password</label>
                <div className="control">
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={this.handleInputChange}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              {error && <p className="has-text-danger">{error}</p>}
              <button type="submit" className="button is-link is-fullwidth">
                Log In
              </button>
              <p
                className="help has-text-centered"
                style={{ marginTop: "1rem" }}
              >
                Enter password to enable admin controls.
              </p>
            </form>
          ) : (
            <div className="box" style={{ maxWidth: 500, margin: "2rem auto" }}>
              <p className="subtitle is-5">
                <strong>Experiment Status:</strong>{" "}
                {running ? (
                  <span className="has-text-success">Running</span>
                ) : (
                  <span className="has-text-danger">Stopped</span>
                )}
              </p>
              <div className="buttons is-centered">
                <button
                  className="button is-success"
                  disabled={running}
                  onClick={this.handleRun}
                >
                  Run
                </button>
                <button
                  className="button is-danger"
                  disabled={!running}
                  onClick={this.handleStop}
                >
                  Stop
                </button>
              </div>
              <p
                className="help has-text-centered"
                style={{ marginTop: "1rem" }}
              >
                Admin controls enabled. You can now run or stop experiments.
              </p>
            </div>
          )}
          {!isAdmin && (
            <div
              className="notification is-info has-text-centered"
              style={{ maxWidth: 500, margin: "2rem auto" }}
            >
              <strong>Guest Mode:</strong> Dashboard is in view-only mode until
              admin logs in.
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Home;
