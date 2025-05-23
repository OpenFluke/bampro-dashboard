import React from "react";
import ReactECharts from "echarts-for-react";

export default class ScoreGraphECharts extends React.Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  // Expose ECharts instance
  getEchartsInstance() {
    return this.chartRef.current?.getEchartsInstance?.();
  }

  getOption() {
    const { scores = [], title = "Score Trend" } = this.props;

    const generations = [...new Set(scores.map((s) => s.generation))].sort(
      (a, b) => a - b
    );

    const avgProgressByGen = generations.map((gen) => {
      const group = scores.filter((s) => s.generation === gen);
      return group.length
        ? group.reduce((sum, s) => sum + s.mean_progress, 0) / group.length
        : 0;
    });

    return {
      title: {
        text: `📈 ${title}`,
        left: "center",
        textStyle: {
          fontSize: 14,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        name: "Generation",
        data: generations,
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: "value",
        name: "Mean Score",
      },
      series: [
        {
          data: avgProgressByGen,
          type: "line",
          smooth: true,
          name: "Average Score",
          showSymbol: false,
          lineStyle: {
            color: "cyan",
            width: 2,
          },
          itemStyle: {
            color: "cyan",
          },
        },
      ],
    };
  }

  render() {
    return (
      <ReactECharts
        ref={this.chartRef}
        option={this.getOption()}
        notMerge={true}
        lazyUpdate={true}
        style={{ width: "700px", height: "300px" }}
      />
    );
  }
}
