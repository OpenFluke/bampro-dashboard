// src/components/TabNav.jsx
import React from "react";

class TabButton extends React.Component {
  render() {
    const { label, active, onClick } = this.props;
    return (
      <li className={active ? "is-active" : ""}>
        <a onClick={onClick}>{label}</a>
      </li>
    );
  }
}

export default class TabNav extends React.Component {
  render() {
    const { active, onSwitch } = this.props;
    return (
      <div className="tabs is-centered is-boxed my-4">
        <ul>
          <TabButton
            label="Status"
            active={active === "status"}
            onClick={() => onSwitch("status")}
          />
          <TabButton
            label="Control"
            active={active === "control"}
            onClick={() => onSwitch("control")}
          />
          <TabButton
            label="Report"
            active={active === "report"}
            onClick={() => onSwitch("report")}
          />
        </ul>
      </div>
    );
  }
}
