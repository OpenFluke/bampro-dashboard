import React, { useMemo } from "react";
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
 * One poly-line per (num_type, mode, variantIndex) triple.
 * No aggregation, so you really see *everything*.
 */
export default function ScoreOverlayGraph({ scores = [] }) {
  // 1️⃣ Pull the x-axis labels just once.
  const generations = useMemo(
    () => [...new Set(scores.map((s) => s.generation))].sort((a, b) => a - b),
    [scores]
  );

  // 2️⃣ Group **by variant** instead of averaging them away.
  const datasets = useMemo(() => {
    const map = new Map();

    scores.forEach((s) => {
      const key = `${s.num_type}_${s.mode}_v${s.variantIndex}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    });

    const lines = [];
    let idx = 0;

    for (const [label, entries] of map.entries()) {
      // Keep slot-to-generation alignment.
      const data = generations.map((g) => {
        const hit = entries.find((e) => e.generation === g);
        return hit ? hit.mean_progress : null;
      });

      const hue = (idx * 47) % 360; // simple, distinct-ish palette
      idx += 1;

      lines.push({
        label,
        data,
        borderColor: `hsl(${hue} 90% 50%)`,
        backgroundColor: "transparent",
        tension: 0.25,
        spanGaps: true,
      });
    }
    return lines;
  }, [scores, generations]);

  if (!generations.length) return <p>No score data yet.</p>;

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
