import React from "react";
import WidgetBox from "./WidgetBox";

export default class StatusPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      showVariantGraphs: false,
      showPlanets: false,
    };
  }

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value.toLowerCase() });
  };

  render() {
    const { status, updates, ws } = this.props;
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

        <div className="field is-grouped mt-3">
          <div className="control">
            <label className="checkbox has-text-white">
              <input
                type="checkbox"
                checked={this.state.showVariantGraphs}
                onChange={() =>
                  this.setState((prev) => ({
                    showVariantGraphs: !prev.showVariantGraphs,
                  }))
                }
              />{" "}
              Show Variant Score Graphs
            </label>
          </div>

          <div className="control ml-4">
            <label className="checkbox has-text-white">
              <input
                type="checkbox"
                checked={this.state.showPlanets}
                onChange={() =>
                  this.setState((prev) => ({ showPlanets: !prev.showPlanets }))
                }
              />{" "}
              Show Planets
            </label>
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

          <div className="column is-full">
            <WidgetBox
              title="📊 Score Overview"
              contentType="scoreOverlay"
              scores={this.props.scores}
            />
          </div>

          {/* Render one score graph widget per num_type + mode */}
          {this.state.showVariantGraphs &&
            this.props.scores &&
            (() => {
              const grouped = {};
              this.props.scores.forEach((s) => {
                const key = `${s.num_type}_${s.mode}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(s);
              });

              return Object.entries(grouped).map(([label, values]) => (
                <div className="column is-half" key={label}>
                  <WidgetBox
                    title={`📈 ${label} Score Trend`}
                    contentType="scoreGraph"
                    scores={values}
                  />
                </div>
              ));
            })()}

          <div className="column is-full">
            <WidgetBox
              title="🚦 Experiment Running Updates"
              ws={ws}
              contentType="runningUpdates"
              updates={updates}
            />
          </div>

          {this.state.showPlanets &&
            filteredPlanets.map((planet) => {
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
