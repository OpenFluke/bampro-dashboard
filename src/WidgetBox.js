import React from "react";
import ScoreGraphECharts from "./ScoreGraphECharts";
import ScoreOverlayGraphECharts from "./ScoreOverlayGraphECharts";
import BestScoreTable from "./BestScoreTable";

//import ScoreGraph from "./ScoreGraph";
//import ScoreOverlayGraph from "./ScoreOverlayGraph";

export default class WidgetBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFullscreen: false,
    };
  }

  toggleFullscreen = () => {
    this.setState((prev) => ({ isFullscreen: !prev.isFullscreen }));
  };

  renderContent() {
    const { status, contentType, planet } = this.props;

    switch (contentType) {
      case "overview":
        return (
          <>
            <p>
              <strong>Timestamp:</strong> {status?.timestamp || "N/A"}
            </p>
            <p>
              <strong>Total Cubes:</strong> {status?.total_cubes ?? "N/A"}
            </p>
            <p>
              <strong>Total Planets:</strong> {status?.total_planets ?? "N/A"}
            </p>
          </>
        );

      case "planetList":
        if (!Array.isArray(status?.planets)) {
          return <p>No planet data available.</p>;
        }

        const sortedPlanets = [...status.planets].sort((a, b) => {
          const aName = a.name || `${a.host}:${a.port}`;
          const bName = b.name || `${b.host}:${b.port}`;
          return aName.localeCompare(bName);
        });

        return (
          <ul className="is-size-7">
            {sortedPlanets.map((p) => (
              <li key={p.name || `${p.host}:${p.port}`}>
                <strong>{p.name || "Unnamed"}</strong> → [
                {p.pos?.join(", ") || "N/A"}] @ {p.host}:{p.port}
              </li>
            ))}
          </ul>
        );

      case "scoreOverlay":
        return <ScoreOverlayGraphECharts scores={this.props.scores || []} />;

      case "bestScores":
        return <BestScoreTable scores={this.props.scores} />;

      case "singlePlanet":
        return planet ? (
          <div className="is-size-7">
            <p>
              <strong>Name:</strong> {planet.name || "Unnamed"}
            </p>
            <p>
              <strong>Coordinates:</strong> {planet.pos?.join(", ") || "N/A"}
            </p>
            <p>
              <strong>Host:</strong> {planet.host}:{planet.port}
            </p>
          </div>
        ) : (
          <p>No planet info available.</p>
        );

      case "scoreGraph":
        return <ScoreGraphECharts scores={this.props.scores || []} />;

      case "runningUpdates":
        const updates = this.props.updates || [];
        const getStageColor = (stage) => {
          switch (stage) {
            case "Generating":
              return "primary";
            case "SpawningAgents":
              return "info";
            case "Running":
              return "warning";
            case "Finished":
              return "success";
            case "Cleaned":
              return "dark";
            default:
              return "light";
          }
        };

        return updates.length > 0 ? (
          <table className="table is-striped is-fullwidth is-size-7">
            <thead>
              <tr>
                <th>Time</th>
                <th>Gen</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Var</th>
                <th>Stage</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((u, i) => (
                <tr key={i}>
                  <td>{new Date(u.timestamp).toLocaleTimeString()}</td>
                  <td>{u.generation}</td>
                  <td>{u.num_type}</td>
                  <td>{u.mode}</td>
                  <td>{u.variant}</td>
                  <td>
                    <span className={`tag is-${getStageColor(u.stage)}`}>
                      {u.stage}
                    </span>
                  </td>
                  <td>{u.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="has-text-grey-light">No experiment updates yet.</p>
        );

      default:
        return <em>Unsupported widget type.</em>;
    }
  }

  timeAgo(isoTime) {
    const then = new Date(isoTime);
    const now = new Date();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 2) return "just now";
    if (diffSec < 60) return `${diffSec} seconds ago`;
    const mins = Math.floor(diffSec / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  }

  render() {
    const { title, ws, status } = this.props;
    const { isFullscreen } = this.state;

    const boxStyle = isFullscreen
      ? {
          position: "fixed",
          top: 100,
          left: 0,
          width: "100vw",
          height: "70vh",
          zIndex: 9999,
          backgroundColor: "white",
          overflow: "auto",
          padding: "2rem",
        }
      : {
          height: "180px",
          overflowY: "auto",
        };

    return (
      <div className="box has-background-light" style={boxStyle}>
        <div className="is-flex is-justify-content-space-between">
          <p className="has-text-weight-semibold mb-2">{title}</p>
          <button
            className="button is-small is-dark is-rounded"
            onClick={this.toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <span className="icon is-small">
              {isFullscreen ? (
                // Exit fullscreen icon (compress)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 9 9 15"></polyline>
                  <polyline points="9 9 15 15"></polyline>
                </svg>
              ) : (
                // Fullscreen icon (expand)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                  <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                </svg>
              )}
            </span>
          </button>
        </div>

        <div>{this.renderContent()}</div>

        {status?.timestamp && (
          <p className="has-text-centered is-size-7 mt-2 has-text-grey">
            <em>
              Updated: {new Date(status.timestamp).toLocaleTimeString()}
              <br />({this.timeAgo(status.timestamp)})
            </em>
          </p>
        )}
      </div>
    );
  }
}
