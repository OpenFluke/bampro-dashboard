// src/components/ReportPanel.jsx
import React from "react";

export default class ReportPanel extends React.Component {
  render() {
    return (
      <div className="content">
        <h4 className="title is-5">Report Builder</h4>
        <p>
          Assemble graphs and text here. When finished, click “Generate Report”
          to export to Word or PDF.
        </p>
        <button className="button is-info">Generate Report</button>

        <article className="message is-info mt-4">
          <div className="message-body">
            <strong>Implementation tips:</strong>
            <ul>
              <li>
                For Word: use <code>html-docx-js</code>.
              </li>
              <li>
                For PDF: use <code>jsPDF</code> or <code>html2pdf.js</code>.
              </li>
              <li>Capture this panel’s HTML and feed it to those libs.</li>
            </ul>
          </div>
        </article>
      </div>
    );
  }
}
