import React from "react";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  ImageRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

import ScoreOverlayGraphECharts from "./ScoreOverlayGraphECharts";
import ScoreGraphECharts from "./ScoreGraphECharts";

// Utility: convert base64 PNG dataURL to Uint8Array
function dataURLtoUint8Array(dataURL) {
  const base64 = dataURL.split(",")[1];
  const binary = atob(base64);
  const len = binary.length;
  const uint8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    uint8[i] = binary.charCodeAt(i);
  }
  return uint8;
}

export default class ReportPanel extends React.Component {
  constructor(props) {
    super(props);
    this.overlayRef = React.createRef();
    this.variantRefs = {};
    this.state = {
      docBusy: false,
      previewHTML: "",
      previewImages: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.scores !== this.props.scores) {
      this.variantRefs = {};
      this.setState({ previewHTML: "", previewImages: null });
    }
  }

  generateImageFromChart = async (inst, width = 700, height = 300) => {
    if (!inst) return null;
    inst.resize({ width, height });
    return inst.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
  };

  async collectGraphImages() {
    await new Promise((res) => setTimeout(res, 700));
    const overlayInst =
      this.overlayRef.current?.chartRef?.current?.getEchartsInstance?.();
    const overlayImg = overlayInst
      ? await this.generateImageFromChart(overlayInst)
      : null;

    const variantImgs = [];
    for (const [label, ref] of Object.entries(this.variantRefs)) {
      const inst = ref?.current?.chartRef?.current?.getEchartsInstance?.();
      if (inst) {
        variantImgs.push({
          label,
          dataUrl: await this.generateImageFromChart(inst),
        });
      }
    }
    return { overlayImg, variantImgs };
  }

  // ------- HTML PREVIEW helpers -------

  getBestScore(scores) {
    if (!scores?.length) return null;
    return scores.reduce(
      (max, s) =>
        max === null || Number(s.mean_progress) > Number(max.mean_progress)
          ? s
          : max,
      null
    );
  }

  getBestScoresByTypeAndModeArr(scores) {
    // Map: `${num_type}|||${mode}` => bestScore
    const bestByCombo = {};
    (scores || []).forEach((s) => {
      const key = `${s.num_type}|||${s.mode}`;
      if (
        !bestByCombo[key] ||
        Number(s.mean_progress) > Number(bestByCombo[key].mean_progress)
      ) {
        bestByCombo[key] = s;
      }
    });
    // Convert to array and sort descending by mean_progress
    return Object.values(bestByCombo).sort(
      (a, b) => Number(b.mean_progress) - Number(a.mean_progress)
    );
  }

  renderHTMLPreview = (graphImages) => {
    const { settings, updates, scores } = this.props;
    // Config
    const entries = [
      ["Name", settings?.name],
      ["Description", settings?.description],
      ["Episodes", settings?.episodes],
      ["Modes", settings?.modes?.join(", ")],
      ["Numerical Types", settings?.numerical_types?.join(", ")],
      ["Planets", settings?.planets?.join(" / ")],
      ["Spectrum Steps", settings?.spectrum_steps],
      ["Max Std Dev", settings?.spectrum_max_stddev],
      ["Auto Launch", settings?.auto_launch ? "Yes" : "No"],
      ["Auto State", settings?.auto_state ? "Yes" : "No"],
    ];
    const movement = settings?.movement || {};
    const translation = movement.translation?.clamp || {};
    const rotation = movement.rotation?.clamp || {};

    // Best
    const best = this.getBestScore(scores);
    const bestsArr = this.getBestScoresByTypeAndModeArr(scores);

    // Tables
    function renderTable(header, rows) {
      return `<table border="1" style="border-collapse:collapse;">
        <tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
        ${rows
          .map(
            (row) =>
              "<tr>" + row.map((v) => `<td>${v ?? "-"}</td>`).join("") + "</tr>"
          )
          .join("")}
      </table>`;
    }

    // Overlay/variant images
    const imgHTML = graphImages?.overlayImg
      ? `<img src="${graphImages.overlayImg}" width="700" height="300"/><br/>`
      : "<em>Overlay image not available.</em>";

    const variantImgsHTML =
      graphImages?.variantImgs && graphImages.variantImgs.length
        ? graphImages.variantImgs
            .map(
              (v) =>
                `<div><strong>${v.label}</strong><br/><img src="${v.dataUrl}" width="700"/></div>`
            )
            .join("<br/>")
        : "<em>No variant images.</em>";

    // Render full HTML preview
    return `
      <h1 style="text-align:center;">OpenFluke Experiment Report</h1>
      <p style="text-align:center;">${new Date().toLocaleString()}</p>
      <hr/>
      <h2>Configuration</h2>
      ${renderTable(
        ["Property", "Value"],
        entries.concat([
          [
            "Translation Clamp",
            `x:${translation.x ?? "-"} y:${translation.y ?? "-"} z:${
              translation.z ?? "-"
            }`,
          ],
          [
            "Rotation Clamp",
            `x:${rotation.x ?? "-"} y:${rotation.y ?? "-"} z:${
              rotation.z ?? "-"
            }`,
          ],
          ["Max Lifespan", `${movement.max_lifespan_seconds ?? "-"} seconds`],
          ["Scoring Method", settings?.scoring?.notes ?? "-"],
        ])
      )}
      <h2>Score Overview</h2>
      ${imgHTML}
      <h2>Best Numerical Type and Mode</h2>
      ${
        best
          ? `<b>Best result:</b> Type = ${best.num_type}, Mode = ${best.mode} (Mean Progress: ${best.mean_progress})`
          : "<em>No scores available.</em>"
      }
      <h3>Best Scores for Each Numerical Type and Mode</h3>
      ${
        bestsArr.length
          ? renderTable(
              ["Gen", "Type", "Mode", "Var", "Mean Progress"],
              bestsArr.map((s) => [
                s.generation,
                s.num_type,
                s.mode,
                s.variantIndex,
                s.mean_progress,
              ])
            )
          : "<em>No best scores found.</em>"
      }
      <h2>Score Summary</h2>
      ${
        scores?.length
          ? renderTable(
              ["Gen", "Type", "Mode", "Var", "Mean Progress"],
              scores.map((s) => [
                s.generation,
                s.num_type,
                s.mode,
                s.variantIndex,
                s.mean_progress,
              ])
            )
          : "<em>No score data available.</em>"
      }
      <h2>Running Updates</h2>
      ${
        updates?.length
          ? renderTable(
              ["Time", "Gen", "Type", "Mode", "Var", "Stage", "Message"],
              updates.map((u) => [
                new Date(u.timestamp).toLocaleTimeString(),
                u.generation,
                u.num_type,
                u.mode,
                u.variant,
                u.stage,
                u.message,
              ])
            )
          : "<em>No updates available.</em>"
      }
      <h2>Individual Graphs</h2>
      ${variantImgsHTML}
    `;
  };

  handlePreviewHTML = async () => {
    const graphImages = await this.collectGraphImages();
    const previewHTML = this.renderHTMLPreview(graphImages);
    this.setState({ previewHTML, previewImages: graphImages });
  };

  // --- DOCX Best-for-each table ---
  getBestScoresByTypeAndMode(scores) {
    const bestByCombo = {};
    (scores || []).forEach((s) => {
      const key = `${s.num_type}|||${s.mode}`;
      if (
        !bestByCombo[key] ||
        Number(s.mean_progress) > Number(bestByCombo[key].mean_progress)
      ) {
        bestByCombo[key] = s;
      }
    });
    // Convert to array and sort descending by mean_progress
    const bests = Object.values(bestByCombo).sort(
      (a, b) => Number(b.mean_progress) - Number(a.mean_progress)
    );
    if (!bests.length)
      return new Paragraph({
        children: [
          new TextRun({ text: "No best scores found.", italics: true }),
        ],
        spacing: { after: 100 },
      });

    const rows = [
      ["Gen", "Type", "Mode", "Var", "Mean Progress"],
      ...bests.map((s) => [
        String(s.generation),
        s.num_type,
        s.mode,
        String(s.variantIndex),
        String(s.mean_progress),
      ]),
    ];

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (cells, idx) =>
          new TableRow({
            children: cells.map(
              (val) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: val, bold: idx === 0 })],
                    }),
                  ],
                })
            ),
          })
      ),
    });
  }

  buildConfigTable(settings) {
    if (!settings) return new Paragraph("No configuration provided.");
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
    ];
    const movement = settings.movement || {};
    const translation = movement.translation?.clamp || {};
    const rotation = movement.rotation?.clamp || {};
    entries.push(
      [
        "Translation Clamp",
        `x:${translation.x ?? "-"} y:${translation.y ?? "-"} z:${
          translation.z ?? "-"
        }`,
      ],
      [
        "Rotation Clamp",
        `x:${rotation.x ?? "-"} y:${rotation.y ?? "-"} z:${rotation.z ?? "-"}`,
      ],
      ["Max Lifespan", `${movement.max_lifespan_seconds ?? "-"} seconds`],
      ["Scoring Method", settings.scoring?.notes ?? "-"]
    );

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: entries.map(
        ([label, val]) =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: label, bold: true })],
                  }),
                ],
              }),
              new TableCell({
                children: [new Paragraph(String(val ?? "-"))],
              }),
            ],
          })
      ),
    });
  }

  buildScoreSummaryTable(scores) {
    if (!scores?.length) return new Paragraph("No score data available.");
    const rows = [
      ["Gen", "Type", "Mode", "Var", "Mean Progress"],
      ...scores.map((s) => [
        String(s.generation),
        s.num_type,
        s.mode,
        String(s.variantIndex),
        String(s.mean_progress),
      ]),
    ];

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (cells, idx) =>
          new TableRow({
            children: cells.map(
              (val) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: val, bold: idx === 0 })],
                    }),
                  ],
                })
            ),
          })
      ),
    });
  }

  buildUpdatesTable(updates) {
    if (!updates?.length) return new Paragraph("No updates available.");

    const rows = [
      ["Time", "Gen", "Type", "Mode", "Var", "Stage", "Message"],
      ...updates.map((u) => [
        new Date(u.timestamp).toLocaleTimeString(),
        String(u.generation),
        u.num_type,
        u.mode,
        String(u.variant),
        u.stage,
        u.message,
      ]),
    ];
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (cells, idx) =>
          new TableRow({
            children: cells.map(
              (val) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: val, bold: idx === 0 })],
                    }),
                  ],
                })
            ),
          })
      ),
    });
  }

  getBestResultParagraph(scores) {
    if (!scores?.length)
      return new Paragraph({
        children: [
          new TextRun({
            text: "Best result: No scores available.",
            italics: true,
          }),
        ],
        spacing: { after: 100 },
      });

    // Find the score with the highest mean_progress
    const best = scores.reduce(
      (max, s) =>
        max === null || Number(s.mean_progress) > Number(max.mean_progress)
          ? s
          : max,
      null
    );

    return new Paragraph({
      children: [
        new TextRun({
          text: `Best result: Type = ${best.num_type}, Mode = ${best.mode} (Mean Progress: ${best.mean_progress})`,
          bold: true,
        }),
      ],
      spacing: { after: 200 },
    });
  }

  buildDocxDoc = async ({ overlayImg, variantImgs }) => {
    const { settings, updates, scores } = this.props;
    const docChildren = [
      new Paragraph({
        text: "OpenFluke Experiment Report",
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleString()}`,
            italics: true,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({ text: "Configuration", heading: HeadingLevel.HEADING_2 }),
      this.buildConfigTable(settings),
      new Paragraph({ text: "", spacing: { after: 150 } }),
      new Paragraph({
        text: "Score Overview",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    // Overlay chart
    if (overlayImg) {
      docChildren.push(
        new Paragraph({}),
        new Paragraph({
          children: [
            new ImageRun({
              data: dataURLtoUint8Array(overlayImg),
              transformation: { width: 700, height: 300 },
            }),
          ],
          spacing: { after: 200 },
        })
      );
    } else {
      docChildren.push(new Paragraph("Overlay image not available."));
    }

    // --- Insert Best Result and Best Scores table here! ---
    docChildren.push(
      new Paragraph({
        text: "Best Numerical Type and Mode",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      this.getBestResultParagraph(scores),
      new Paragraph({
        text: "Best Scores for Each Numerical Type and Mode",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }),
      this.getBestScoresByTypeAndMode(scores)
    );

    docChildren.push(
      new Paragraph({ text: "Score Summary", heading: HeadingLevel.HEADING_2 }),
      this.buildScoreSummaryTable(scores),
      new Paragraph({ text: "", spacing: { after: 150 } }),
      new Paragraph({
        text: "Running Updates",
        heading: HeadingLevel.HEADING_2,
      }),
      this.buildUpdatesTable(updates),
      new Paragraph({ text: "", spacing: { after: 150 } }),
      new Paragraph({
        text: "Individual Graphs",
        heading: HeadingLevel.HEADING_2,
      })
    );

    // Variant images
    if (variantImgs && variantImgs.length) {
      for (const v of variantImgs) {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: v.label, bold: true })],
          }),
          v.dataUrl
            ? new Paragraph({
                children: [
                  new ImageRun({
                    data: dataURLtoUint8Array(v.dataUrl),
                    transformation: { width: 700, height: 300 },
                  }),
                ],
                spacing: { after: 150 },
              })
            : new Paragraph("Image not available.")
        );
      }
    } else {
      docChildren.push(new Paragraph("No variant images."));
    }

    return new Document({ sections: [{ children: docChildren }] });
  };

  handleDownloadDocx = async () => {
    this.setState({ docBusy: true });
    try {
      const graphImages = await this.collectGraphImages();
      const doc = await this.buildDocxDoc(graphImages);
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "OpenFluke_Report.docx");
    } catch (e) {
      alert("Failed to generate DOCX: " + e);
    } finally {
      this.setState({ docBusy: false });
    }
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
    const grouped = {};
    (this.props.scores || []).forEach((s) => {
      const key = `${s.num_type}_${s.mode}`;
      (grouped[key] = grouped[key] || []).push(s);
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
    const { docBusy, previewHTML } = this.state;
    return (
      <div className="content">
        <h4 className="title is-5">Report Builder (docx)</h4>
        <p className="mb-2">
          This compiles your experiment into a readable Word report.
          <br />
          Preview or export below.
        </p>
        <div className="buttons mb-4">
          <button className="button is-link" onClick={this.handlePreviewHTML}>
            Preview HTML
          </button>
          <button
            className="button is-danger"
            disabled={docBusy}
            onClick={this.handleDownloadDocx}
          >
            {docBusy ? "Preparing DOCX…" : "Download DOCX"}
          </button>
        </div>
        {/* Offscreen rendering for screenshot */}
        <div style={{ position: "absolute", left: "-9999px", height: "1px" }}>
          {this.renderOverlayGraph()}
          {this.renderVariantGraphs()}
        </div>
        {/* Preview panel for HTML output */}
        {previewHTML && (
          <div className="box mt-5">
            <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
          </div>
        )}
      </div>
    );
  }
}
