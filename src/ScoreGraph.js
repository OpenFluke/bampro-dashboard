import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default class ScoreGraph extends React.Component {
  render() {
    const { scores = [], title = "Score Trend" } = this.props;

    const gens = [...new Set(scores.map((v) => v.generation))].sort(
      (a, b) => a - b
    );
    const byGen = gens.map((g) => {
      const entries = scores.filter((v) => v.generation === g);
      const avg =
        entries.reduce((sum, v) => sum + v.mean_progress, 0) / entries.length;
      return avg;
    });

    return (
      <div className="is-size-7">
        <p className="has-text-weight-semibold">{title}</p>
        <Line
          data={{
            labels: gens,
            datasets: [
              {
                label: "Mean Score",
                data: byGen,
                borderColor: "cyan",
                backgroundColor: "rgba(0,255,255,0.2)",
              },
            ],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true },
              x: { title: { display: true, text: "Generation" } },
            },
          }}
        />
      </div>
    );
  }
}
