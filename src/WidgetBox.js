// src/components/StatusPanel.jsx
import React from "react";

class WidgetBox extends React.Component {
  render() {
    const { title } = this.props;
    return (
      <div className="box has-background-light" style={{ height: "180px" }}>
        <p className="has-text-weight-semibold mb-2">{title}</p>
        <p className="has-text-centered">
          <em>Placeholder for live graph</em>
        </p>
      </div>
    );
  }
}

export default class StatusPanel extends React.Component {
  render() {
    const { widgets, addWidget } = this.props;
    return (
      <>
        <button className="button is-link mb-4" onClick={addWidget}>
          + Add Widget
        </button>

        <div className="columns is-multiline ">
          {widgets.map((w) => (
            <div
              key={w.id}
              className="column is-full-mobile is-half-tablet is-one-third-desktop "
            >
              <WidgetBox title={w.title} />
            </div>
          ))}
        </div>
      </>
    );
  }
}
