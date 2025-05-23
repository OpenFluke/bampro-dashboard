import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * A class-based React component that renders a line chart with one poly-line per
 * (num_type, mode, variantIndex) triple. No aggregation is performed, ensuring all
 * variants are visible.
 */
export default class ScoreOverlayGraph extends React.Component {
  constructor(props) {
    super(props);
    this.prevScores = null;
    this.cachedGenerations = null;
    this.cachedDatasets = null;
  }

  computeGenerationsAndDatasets(scores) {
    const generations = [...new Set(scores.map((s) => s.generation))].sort(
      (a, b) => a - b
    );

    const map = new Map();
    scores.forEach((s) => {
      const key = `${s.num_type}_${s.mode}_v${s.variantIndex}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });

    const datasets = [];
    let idx = 0;
    for (const [label, entries] of map.entries()) {
      const data = generations.map((g) => {
        const hit = entries.find((e) => e.generation === g);
        return hit ? hit.mean_progress : null;
      });
      const hue = (idx * 47) % 360;
      idx += 1;
      datasets.push({
        label,
        data,
        borderColor: `hsl(${hue} 90% 50%)`,
        backgroundColor: "transparent",
        tension: 0.25,
        spanGaps: true,
      });
    }

    return { generations, datasets };
  }

  render() {
    const { scores = [] } = this.props;

    if (this.prevScores !== scores) {
      const { generations, datasets } =
        this.computeGenerationsAndDatasets(scores);
      this.cachedGenerations = generations;
      this.cachedDatasets = datasets;
      this.prevScores = scores;
    }

    const generations = this.cachedGenerations;
    const datasets = this.cachedDatasets;

    if (!generations || !generations.length) {
      return <p>No score data yet.</p>;
    }

    return (
      <Line
        data={{ labels: generations, datasets }}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "📊 Score Trend — every numerical type · mode · variant (no averaging)",
            },
            legend: { display: true, position: "bottom" },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Mean Score" },
            },
            x: { title: { display: true, text: "Generation" } },
          },
        }}
      />
    );
  }
}
