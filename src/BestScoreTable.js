import React from "react";

export default class BestScoreTable extends React.Component {
  getBestByType(scores) {
    const bestByType = {};

    scores.forEach((s) => {
      const key = s.num_type;
      if (!bestByType[key] || s.mean_progress > bestByType[key].mean_progress) {
        bestByType[key] = s;
      }
    });

    // Convert to array and sort descending
    return Object.values(bestByType).sort(
      (a, b) => b.mean_progress - a.mean_progress
    );
  }

  render() {
    const scores = this.props.scores || [];
    const bestScores = this.getBestByType(scores);

    if (bestScores.length === 0) {
      return <p className="has-text-grey-light">No scores to display.</p>;
    }

    return (
      <div className="table-container">
        <table className="table is-fullwidth is-striped is-size-7">
          <thead>
            <tr>
              <th>Numerical Type</th>
              <th>Mode</th>
              <th>Variant</th>
              <th>Generation</th>
              <th>Best Score</th>
            </tr>
          </thead>
          <tbody>
            {bestScores.map((s) => (
              <tr key={`${s.num_type}_${s.mode}_${s.variantIndex}`}>
                <td>{s.num_type}</td>
                <td>{s.mode}</td>
                <td>{s.variantIndex}</td>
                <td>{s.generation}</td>
                <td>{s.mean_progress.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
