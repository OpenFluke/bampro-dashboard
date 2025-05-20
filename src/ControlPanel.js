import React from "react";

export default class ControlPanel extends React.Component {
  render() {
    const {
      isAdmin,
      running,
      settings,
      onRun,
      onStop,
      onSettingChange,
      sendControlMessage,
    } = this.props;

    return (
      <div className="box" style={{ maxWidth: 720, margin: "0 auto" }}>
        {!isAdmin && (
          <article className="message is-warning">
            <div className="message-body has-text-centered">
              Admin login required to edit experiment settings. Viewing
              read-only preview.
            </div>
          </article>
        )}

        <p className="mb-4">
          <strong>Experiment status:</strong>{" "}
          {running ? (
            <span className="has-text-success">Running</span>
          ) : (
            <span className="has-text-danger">Stopped</span>
          )}
        </p>

        {isAdmin && (
          <div className="buttons">
            <button
              className="button is-success"
              disabled={running}
              onClick={() => sendControlMessage("run_experiment", settings)}
            >
              ▶ Run
            </button>
            <button
              className="button is-danger"
              disabled={!running}
              onClick={() => sendControlMessage("stop_experiment", null)}
            >
              ■ Stop
            </button>
          </div>
        )}

        <hr />
        <h3 className="title is-6">Experiment Settings</h3>

        <div className="field">
          <label className="label">Name</label>
          <input
            className="input"
            type="text"
            name="name"
            value={settings.name || ""}
            disabled={!isAdmin}
            onChange={onSettingChange}
          />
        </div>

        <div className="field">
          <label className="label">Numerical Types</label>
          <input
            className="input"
            type="text"
            name="numerical_types"
            value={
              Array.isArray(settings.numerical_types)
                ? settings.numerical_types.join(", ")
                : ""
            }
            disabled={!isAdmin}
            onChange={(e) =>
              onSettingChange({
                target: {
                  name: "numerical_types",
                  value: e.target.value.split(",").map((s) => s.trim()),
                },
              })
            }
          />
        </div>

        <div className="field">
          <label className="label">Planets</label>
          <input
            className="input"
            type="text"
            name="planets"
            value={
              Array.isArray(settings.planets) ? settings.planets.join(", ") : ""
            }
            disabled={!isAdmin}
            onChange={(e) =>
              onSettingChange({
                target: {
                  name: "planets",
                  value: e.target.value.split(",").map((s) => s.trim()),
                },
              })
            }
          />
        </div>

        <div className="field is-horizontal">
          <div className="field-body">
            <div className="field">
              <label className="label">Spectrum Steps</label>
              <input
                className="input"
                type="number"
                name="spectrum_steps"
                value={settings.spectrum_steps ?? ""}
                disabled={!isAdmin}
                onChange={onSettingChange}
              />
            </div>
            <div className="field">
              <label className="label">Spectrum Max StdDev</label>
              <input
                className="input"
                type="number"
                step="0.001"
                name="spectrum_max_stddev"
                value={settings.spectrum_max_stddev ?? ""}
                disabled={!isAdmin}
                onChange={onSettingChange}
              />
            </div>
          </div>
        </div>

        <div className="field mt-4">
          <label className="checkbox">
            <input
              type="checkbox"
              name="auto_state"
              checked={!!settings.auto_state}
              disabled={!isAdmin}
              onChange={(e) =>
                onSettingChange({
                  target: {
                    name: "auto_state",
                    value: e.target.checked,
                  },
                })
              }
            />
            &nbsp; Auto Resume Model State
          </label>
        </div>
      </div>
    );
  }
}
