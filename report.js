'use strict';

const html = require('./html.js');
const fs = require('fs');

const tableOpen = html.tableOpen;
const tableClose = html.tableClose;
const tableRow = html.tableRow;
const h1 = html.h1;
const h2 = html.h2;
const h3 = html.h3;
const h4 = html.h4;
const h5 = html.h5;
const p = html.p;
const li = html.li;

function mapReportData(data){
  // var data = JSON.parse(fs.readFileSync(dataFile, {encoding:'utf8', flag:'r'}));
  var reportData = {};
  var descriptions = JSON.parse(fs.readFileSync('./issue-descriptions.json', {encoding:'utf8', flag:'r'}));
  data.forEach(test => {
    test.result.issues.forEach(issue => {
      var severity = issue.runnerExtras.impact;
      var title = issue.runnerExtras.help;
      var name = title.replace(/ /g,"_");

      // add object by severity.
      if (typeof reportData[severity] == 'undefined'){
        reportData[severity] = {
          issues: [],
          severity: severity
        }
      }
      
      // add object by issue
      if (typeof reportData[severity]['issues'][name] == 'undefined') {
        var descItem = descriptions.filter(item => {
          return item.issue == name;
        })[0];
        if (typeof descItem != 'undefined'){
          var description = descItem.description;
        }
        reportData[severity]['issues'][name] = {
          title: title,
          severity: severity,
          description: description? description : p(`Description TBD`),
          pages: [],
          link: `<a target="_blank" title="${title}" href="${issue.runnerExtras.helpUrl}">aXe Rule</a>`
        };
      }
      reportData[severity]['issues'][name].pages.push(
        {
          page: test.test.page,
          url: `<a href="${test.test.url}" target="_blank">${test.test.url}</a>`
        });
    });
  });
  return reportData;
}

function reportHTML(data, tests, client, runner, standard){
  const severities = ['Critical', 'Serious', 'Moderate', 'Minor'];
  var d = new Date();
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var date = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  var style = `
  li,
  p {
    color: #000000;
    font-size: 12pt;
    font-family: "Arial";
    margin: 0 0 12px;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family:"Arial";
    line-height:1.15;
    page-break-after:avoid;
    orphans:2;
    widows:2;
    text-align:left;
    color:#000000;
    font-weight: 400;
  }
  h1{
    font-size:24pt;
    padding-bottom:6pt;
  }
  h2{
    padding-top:22pt;
    font-size:22pt;
    padding-bottom:6pt;
  }
  h3{
    padding-top:20pt;
    font-size:20pt;
    padding-bottom:4pt;
    color: #666;

  }
  h4{padding-top:18pt;
  font-size:18pt;
  padding-bottom:4pt;
  }

  h5{
    padding-top:16pt;
    font-size:16pt;
    padding-bottom:4pt;
  }

  h6 {
    padding-top:14pt;
    color:#666666;
    font-size:14pt;
    padding-bottom:4pt;
    font-style:italic;
  }
  table {
    width:100%;
    border: 1px solid #000;
    border-collapse:collapse;
    margin: 32px 0;"
  }
  td,
  th {
    padding: 4pt;
    border: 1px solid #000;
  }
  th {
    font-weight: bold;
  }`;
  var report = `<html><head><title>${client} Accessibility Audit - ${date}</title><style>${style.trim()}</style></head><body style="margin:36px">`;
  report += h1(`${client} Accessibility Audit`);
  report += p('Performed by: Sandstorm Design');
  report += p(`Date: ${date}`);
  report += p(`&nbsp;`);
  report += p(`This document provides a summary and assessment of issues identified in automated scan.`);
  report += h2(`Methodology`);
  report += p(`All tests were run using the Pa11y (<a href="https://github.com/pa11y/pa11y">https://github.com/pa11y/pa11y</a>) NodeJS tool. Tests were run using <strong>${runner}</strong> as the test runner, and according to the <strong>${standard}</strong> standard.`);

  report += h2(`Representative URLs tested`);
  report += tableOpen(['Content Type/Variation','Example URL Scanned']);
  tests.forEach(test => {
    report += tableRow([test.page, test.url]);
  });
  report += tableClose();

  report += h2(`Issue Impact and Effort Summary`);
  report += tableOpen(['Issue', 'Severity', 'Solution', 'Effort', 'Estimated Dev Hours', 'Parties']);
  // build explanations in this loop
  var expl = h2(`Issue Explanations and Assessments`);
  var i =1;
  severities.forEach(severity => {
    var level = data[severity.toLowerCase()];
    expl += h3(`${severity} Issues`);
    for (var key in level.issues) {
      var issue = level.issues[key];
      report += tableRow([issue.title, severity, '', '', '', '']);
      expl += h4(`${i}. ${issue.title}`);
      expl += p(issue.link);
      issue.description.trim().split('</p>').forEach(text => {
        if (text.replace('<p>','').length > 0){
          expl += p(text.replace('<p>','').trim());
        }
      });
      expl += tableOpen(['Page', 'Url']);
      var includedPages = [];
      issue.pages.forEach(page => {
        if (includedPages.indexOf(page.url) > -1){
          // already done
        } else {
          expl += tableRow([page.page, page.url]);
          includedPages.push(page.url);
        }
      });
      expl += tableClose();
      i++;
    };
  });
  report += tableClose();

  report += expl;
  report += '</body></html>';
  return report;
}

exports.mapReportData = mapReportData;
exports.reportHTML = reportHTML;
