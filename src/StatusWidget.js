import React from "react";

export default class StatusWidget extends React.Component {
  render() {
    const { status } = this.props;
    if (!status) return null;

    return (
      <div className="box has-background-dark has-text-light">
        <h2 className="title is-5 has-text-white">🛰️ Game Status</h2>
        <p>⏱ Timestamp: {status.timestamp}</p>
        <p>🧊 Cubes: {status.total_cubes}</p>
        <p>🪐 Planets: {status.total_planets}</p>

        <hr />
        <strong className="has-text-white">Cubes by Host:</strong>
        <ul>
          {Object.entries(status.cube_hosts).map(([host, count]) => (
            <li key={host}>
              {host}: {count}
            </li>
          ))}
        </ul>

        <hr />
        <strong className="has-text-white">Planet Locations:</strong>
        <ul>
          {status.planets.map((p) => (
            <li key={p.name}>
              {p.name} → [{p.pos.join(", ")}] @ {p.host}:{p.port}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
