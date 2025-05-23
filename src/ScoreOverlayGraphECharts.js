import React from "react";
import ReactECharts from "echarts-for-react";

export default class ScoreOverlayGraphECharts extends React.Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  getOption() {
    const { scores = [] } = this.props;

    const generations = [...new Set(scores.map((s) => s.generation))].sort(
      (a, b) => a - b
    );

    const grouped = new Map();
    scores.forEach((s) => {
      const key = `${s.num_type}_${s.mode}_v${s.variantIndex}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(s);
    });

    const series = [];
    let idx = 0;
    for (const [label, entries] of grouped.entries()) {
      const data = generations.map((g) => {
        const point = entries.find((e) => e.generation === g);
        return point ? point.mean_progress : null;
      });

      const hue = (idx * 47) % 360;
      series.push({
        name: label,
        type: "line",
        data,
        smooth: true,
        connectNulls: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: `hsl(${hue}, 80%, 60%)`,
        },
      });
      idx += 1;
    }

    return {
      title: {
        text: "📊 Score Trend — All Variants",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      legend: {
        type: "scroll",
        top: "bottom",
      },
      grid: {
        left: 60,
        right: 40,
        top: 70,
        bottom: 100,
      },
      xAxis: {
        type: "category",
        name: "Generation",
        data: generations,
      },
      yAxis: {
        type: "value",
        name: "Mean Score",
      },
      series,
    };
  }

  downloadImage = () => {
    const echartsInstance = this.chartRef.current?.getEchartsInstance?.();
    if (!echartsInstance) return;

    const dataUrl = echartsInstance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `score_overlay_graph_${Date.now()}.png`;
    link.click();
  };

  render() {
    const hasData = this.props.scores?.length > 0;

    return (
      <div style={{ marginBottom: "2rem" }}>
        <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
          <p className="has-text-weight-semibold is-size-5">
            📈 Score Overview
          </p>
          {hasData && (
            <button
              className="button is-small is-primary"
              onClick={this.downloadImage}
            >
              Download Image
            </button>
          )}
        </div>

        {hasData ? (
          <ReactECharts
            ref={this.chartRef}
            option={this.getOption()}
            style={{ width: "100%", height: "400px" }}
            notMerge={true}
            lazyUpdate={true}
          />
        ) : (
          <p className="has-text-grey-light">No score data available yet.</p>
        )}
      </div>
    );
  }
}
