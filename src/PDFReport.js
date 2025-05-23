import React from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import ScoreOverlayGraphECharts from "./ScoreOverlayGraphECharts";
import ScoreGraphECharts from "./ScoreGraphECharts";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { textAlign: "center", fontSize: 24, marginBottom: 10 },
  subtitle: { textAlign: "center", fontSize: 14, marginBottom: 20 },
  section: { margin: 10, padding: 10 },
  sectionTitle: { fontSize: 18, marginBottom: 10 },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: { flexDirection: "row" },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontSize: 12,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#000",
    flex: 1,
  },
  image: { marginVertical: 10 },
});

// PDFReport component using @react-pdf/renderer
const PDFReport = ({
  timestamp,
  status,
  settings,
  updates,
  scores,
  images,
}) => {
  const renderConfigTable = () => {
    if (!settings) return <Text>No configuration provided.</Text>;

    const configData = [
      ["Name", settings.name || "N/A"],
      ["Description", settings.description || "N/A"],
      ["Episodes", settings.episodes || "N/A"],
      ["Modes", settings.modes?.join(", ") || "N/A"],
      ["Numerical Types", settings.numerical_types?.join(", ") || "N/A"],
      ["Planets", settings.planets?.join(" / ") || "N/A"],
      ["Spectrum Steps", settings.spectrum_steps || "N/A"],
      ["Max Std Dev", settings.spectrum_max_stddev || "N/A"],
      ["Auto Launch", settings.auto_launch ? "Yes" : "No"],
      ["Auto State", settings.auto_state ? "Yes" : "No"],
      [
        "Translation Clamp",
        settings.movement?.translation?.clamp
          ? `x: ${settings.movement.translation.clamp.x}, y: ${settings.movement.translation.clamp.y}, z: ${settings.movement.translation.clamp.z}`
          : "N/A",
      ],
      [
        "Rotation Clamp",
        settings.movement?.rotation?.clamp
          ? `x: ${settings.movement.rotation.clamp.x}, y: ${settings.movement.rotation.clamp.y}, z: ${settings.movement.rotation.clamp.z}`
          : "N/A",
      ],
      [
        "Max Lifespan",
        settings.movement?.max_lifespan_seconds
          ? `${settings.movement.max_lifespan_seconds}s`
          : "N/A",
      ],
      ["Scoring Method", settings.scoring?.notes || "N/A"],
    ];

    return (
      <View style={styles.table}>
        {configData.map(([label, value], index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={[styles.tableCell, styles.tableHeader]}>{label}</Text>
            <Text style={styles.tableCell}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderScoreSummaryTable = () => {
    if (!scores || scores.length === 0)
      return <Text>No score data available.</Text>;

    return (
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Gen", "Type", "Mode", "Var", "Mean Progress"].map((header) => (
            <Text style={[styles.tableCell, styles.tableHeader]} key={header}>
              {header}
            </Text>
          ))}
        </View>
        {scores.map((s, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{s.generation}</Text>
            <Text style={styles.tableCell}>{s.num_type}</Text>
            <Text style={styles.tableCell}>{s.mode}</Text>
            <Text style={styles.tableCell}>{s.variantIndex}</Text>
            <Text style={styles.tableCell}>{s.mean_progress}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderUpdatesTable = () => {
    if (!updates || updates.length === 0)
      return <Text>No updates available.</Text>;

    return (
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Time", "Gen", "Type", "Mode", "Var", "Stage", "Message"].map(
            (header) => (
              <Text style={[styles.tableCell, styles.tableHeader]} key={header}>
                {header}
              </Text>
            )
          )}
        </View>
        {updates.map((u, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>
              {new Date(u.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.tableCell}>{u.generation}</Text>
            <Text style={styles.tableCell}>{u.num_type}</Text>
            <Text style={styles.tableCell}>{u.mode}</Text>
            <Text style={styles.tableCell}>{u.variant}</Text>
            <Text style={styles.tableCell}>{u.stage}</Text>
            <Text style={styles.tableCell}>{u.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>🧠 OpenFluke Experiment Report</Text>
        <Text style={styles.subtitle}>{timestamp}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configuration</Text>
          {renderConfigTable()}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Score Overview</Text>
          {images?.overlayImg ? (
            <Image
              src={images.overlayImg}
              style={{ width: 500, height: 200 }}
            />
          ) : (
            <Text>Overlay image not available.</Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Score Summary</Text>
          {renderScoreSummaryTable()}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚦 Running Updates</Text>
          {renderUpdatesTable()}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📉 Individual Graphs</Text>
          {images?.variantImgs && images.variantImgs.length > 0 ? (
            images.variantImgs.map((v, index) => (
              <View key={index} style={styles.image}>
                <Text>{v.label}</Text>
                <Image src={v.dataUrl} style={{ width: 500, height: 200 }} />
              </View>
            ))
          ) : (
            <Text>No individual graphs available.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default class ReportPanel extends React.Component {
  constructor(props) {
    super(props);
    this.overlayRef = React.createRef();
    this.variantRefs = {};
    this.state = {
      previewHTML: null,
      chartImages: null,
    };
  }

  async componentDidMount() {
    const graphImages = await this.collectGraphImages();
    this.setState({ chartImages: graphImages });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.scores !== this.props.scores) {
      this.variantRefs = {};
      this.collectGraphImages().then((graphImages) =>
        this.setState({ chartImages: graphImages })
      );
    }
  }

  generateImageFromChart = async (
    echartsInstance,
    width = 700,
    height = 300
  ) => {
    echartsInstance.resize({ width, height });
    return echartsInstance.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
  };

  async collectGraphImages() {
    const overlayInstance =
      this.overlayRef.current?.chartRef?.current?.getEchartsInstance?.();
    const overlayImg = overlayInstance
      ? await this.generateImageFromChart(overlayInstance)
      : null;

    const variantImgs = [];
    for (const [label, ref] of Object.entries(this.variantRefs)) {
      const instance = ref?.current?.chartRef?.current?.getEchartsInstance?.();
      if (instance) {
        const dataUrl = await this.generateImageFromChart(instance);
        variantImgs.push({ label, dataUrl });
      }
    }

    return { overlayImg, variantImgs };
  }

  renderConfigSection(settings) {
    if (!settings) return "<p>No configuration provided.</p>";

    const entries = [
      ["Name", settings.name],
      ["Description", settings.description],
      ["Episodes", settings.episodes],
      ["Modes", settings.modes?.join(", ")],
      ["Numerical Types", settings.numerical_types?.join(", ")],
      ["Planets", settings.planets?.join(" / ")],
      ["Spectrum Steps", settings.spectrum_steps],
      ["Max Std Dev", settings.spectrum_max_stddev],
      ["Auto Launch", settings.auto_launch ? "Yes" : "No"],
      ["Auto State", settings.auto_state ? "Yes" : "No"],
      [
        "Translation Clamp",
        settings.movement?.translation?.clamp
          ? `x:${settings.movement.translation.clamp.x}, y:${settings.movement.translation.clamp.y}, z:${settings.movement.translation.clamp.z}`
          : "N/A",
      ],
      [
        "Rotation Clamp",
        settings.movement?.rotation?.clamp
          ? `x:${settings.movement.rotation.clamp.x}, y:${settings.movement.rotation.clamp.y}, z:${settings.movement.rotation.clamp.z}`
          : "N/A",
      ],
      [
        "Max Lifespan",
        settings.movement?.max_lifespan_seconds
          ? `${settings.movement.max_lifespan_seconds}s`
          : "N/A",
      ],
      ["Scoring Method", settings.scoring?.notes || "N/A"],
    ];

    return `
      <table border="1" cellspacing="0" cellpadding="6">
        ${entries
          .map(
            ([label, val]) =>
              `<tr><td><strong>${label}</strong></td><td>${
                val || "N/A"
              }</td></tr>`
          )
          .join("")}
      </table>
    `;
  }

  renderScoreSummaryTable(scores) {
    if (!scores || scores.length === 0)
      return "<p>No score data available.</p>";

    return `
      <table border="1" cellspacing="0" cellpadding="6">
        <tr><th>Gen</th><th>Type</th><th>Mode</th><th>Var</th><th>Mean Progress</th></tr>
        ${scores
          .map(
            (s) =>
              `<tr><td>${s.generation}</td><td>${s.num_type}</td><td>${s.mode}</td><td>${s.variantIndex}</td><td>${s.mean_progress}</td></tr>`
          )
          .join("")}
      </table>
    `;
  }

  renderUpdatesTable(updates) {
    if (!updates || updates.length === 0) return "<p>No updates available.</p>";

    return `
      <table border="1" cellspacing="0" cellpadding="4">
        <tr><th>Time</th><th>Gen</th><th>Type</th><th>Mode</th><th>Var</th><th>Stage</th><th>Message</th></tr>
        ${updates
          .map(
            (u) =>
              `<tr><td>${new Date(u.timestamp).toLocaleTimeString()}</td><td>${
                u.generation
              }</td><td>${u.num_type}</td><td>${u.mode}</td><td>${
                u.variant
              }</td><td>${u.stage}</td><td>${u.message}</td></tr>`
          )
          .join("")}
      </table>
    `;
  }

  async generateHTML(chartImages) {
    const { status, settings, updates, scores } = this.props;
    const { overlayImg, variantImgs } = chartImages || {};

    return `
      <h1 style="text-align:center;font-size:2em;">🧠 <strong>OpenFluke Experiment Report</strong></h1>
      <p style="text-align:center;">${new Date().toLocaleString()}</p>
      <hr/>
      <h2>⚙️ Configuration</h2>
      ${this.renderConfigSection(settings)}
      <h2>📊 Score Overview</h2>
      ${
        overlayImg
          ? `<p><img src="${overlayImg}" width="700" height="300" /></p>`
          : "<p>Overlay image not available.</p>"
      }
      <h2>📈 Score Summary</h2>
      ${this.renderScoreSummaryTable(scores)}
      <h2>🚦 Running Updates</h2>
      ${this.renderUpdatesTable(updates)}
      <h2>📉 Individual Graphs</h2>
      ${
        variantImgs
          ?.map(
            (v) =>
              `<p><strong>${v.label}</strong><br/><img src="${v.dataUrl}" width="700"/></p>`
          )
          .join("") || "<p>No individual graphs available.</p>"
      }
    `;
  }

  handlePreviewHTML = async () => {
    const chartImages = await this.collectGraphImages();
    const html = await this.generateHTML(chartImages);
    this.setState({ previewHTML: html, chartImages });
  };

  renderOverlayGraph() {
    return (
      <ScoreOverlayGraphECharts
        ref={this.overlayRef}
        scores={this.props.scores}
      />
    );
  }

  renderVariantGraphs() {
    const { scores = [] } = this.props;
    const grouped = {};

    scores.forEach((s) => {
      const key = `${s.num_type}_${s.mode}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    return Object.entries(grouped).map(([label, values]) => {
      if (!this.variantRefs[label]) this.variantRefs[label] = React.createRef();
      return (
        <ScoreGraphECharts
          key={label}
          ref={this.variantRefs[label]}
          scores={values}
          title={label}
        />
      );
    });
  }

  render() {
    const { previewHTML, chartImages } = this.state;

    return (
      <div className="content">
        <h4 className="title is-5">📑 Report Builder</h4>
        <p className="mb-2">
          This compiles your current experiment into a readable report. Preview
          before exporting to PDF.
        </p>
        <div className="buttons mb-4">
          <button className="button is-link" onClick={this.handlePreviewHTML}>
            🔍 Preview HTML
          </button>
          <PDFDownloadLink
            document={
              <PDFReport
                timestamp={new Date().toLocaleString()}
                status={this.props.status}
                settings={this.props.settings}
                updates={this.props.updates}
                scores={this.props.scores}
                images={chartImages}
              />
            }
            fileName="OpenFluke_Report.pdf"
          >
            {({ loading }) => (
              <button className="button is-danger" disabled={loading}>
                {loading ? "Preparing PDF..." : "📥 Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
        <div style={{ position: "absolute", left: "-9999px", height: "1px" }}>
          {this.renderOverlayGraph()}
          {this.renderVariantGraphs()}
        </div>
        {previewHTML && (
          <div className="box mt-5">
            <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
          </div>
        )}
      </div>
    );
  }
}
