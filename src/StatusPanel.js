import React from "react";
import WidgetBox from "./WidgetBox";

export default class StatusPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
    };
  }

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value.toLowerCase() });
  };

  render() {
    const { status, ws } = this.props;
    const { searchTerm } = this.state;

    const planets = Array.isArray(status?.planets)
      ? [...status.planets].sort((a, b) => {
          // Sort by name, then fallback to host+port
          const aName = a.name || `${a.host}:${a.port}`;
          const bName = b.name || `${b.host}:${b.port}`;
          return aName.localeCompare(bName);
        })
      : [];

    const filteredPlanets = planets.filter((planet) => {
      const id = planet.name || `${planet.host}:${planet.port}`;
      return id.toLowerCase().includes(searchTerm);
    });

    return (
      <>
        <div className="field mb-4">
          <div className="control">
            <input
              className="input"
              type="text"
              placeholder="Search planets..."
              value={this.state.searchTerm}
              onChange={this.handleSearchChange}
            />
          </div>
        </div>

        <div className="columns is-multiline">
          <div className="column is-one-third">
            <WidgetBox
              title="🛰️ System Overview"
              ws={ws}
              contentType="overview"
              status={status}
            />
          </div>

          <div className="column is-one-third">
            <WidgetBox
              title="🪐 Planet List"
              ws={ws}
              contentType="planetList"
              status={status}
            />
          </div>

          <div className="column is-one-third">
            <WidgetBox
              title="📊 Cube Distribution"
              ws={ws}
              contentType="cubeHosts"
              status={status}
            />
          </div>

          {filteredPlanets.map((planet) => {
            const key = `${planet.name || "planet"}-${planet.host}:${
              planet.port
            }`;
            return (
              <div key={key} className="column is-one-third">
                <WidgetBox
                  title={`🌍 ${planet.name || "Unnamed Planet"}`}
                  ws={ws}
                  contentType="singlePlanet"
                  status={status}
                  planet={planet}
                />
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
