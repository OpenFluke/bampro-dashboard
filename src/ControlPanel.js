// src/components/ControlPanel.jsx
import React from "react";

export default class ControlPanel extends React.Component {
  render() {
    const { isAdmin, running, settings, onRun, onStop, onSettingChange } =
      this.props;

    if (!isAdmin) {
      return (
        <article className="message is-warning">
          <div className="message-body has-text-centered">
            Admin login required to access experiment controls.
          </div>
        </article>
      );
    }

    return (
      <div className="box" style={{ maxWidth: 640, margin: "0 auto" }}>
        <p className="mb-4">
          <strong>Experiment status:</strong>{" "}
          {running ? (
            <span className="has-text-success">Running</span>
          ) : (
            <span className="has-text-danger">Stopped</span>
          )}
        </p>

        <div className="buttons">
          <button
            className="button is-success"
            disabled={running}
            onClick={onRun}
          >
            ▶ Run
          </button>
          <button
            className="button is-danger"
            disabled={!running}
            onClick={onStop}
          >
            ■ Stop
          </button>
        </div>

        <hr />
        <h3 className="title is-6">Settings (placeholder)</h3>
        <div className="field">
          <label className="label">Epochs</label>
          <input
            className="input"
            type="number"
            name="epochs"
            min="1"
            value={settings.epochs}
            onChange={onSettingChange}
          />
        </div>
      </div>
    );
  }
}
