'use strict';

const pa11y = require('pa11y');
const fs = require('fs');
const googleAPI = require('./google.js');
const report = require('./report.js');
const sitemapParser = require('sitemap-stream-parser');
const mapReportData = report.mapReportData;
const reportHTML = report.reportHTML;

const runner = 'aXe';
const standard = 'WCAG 2.0 AAA';

const config = {
    runners: [
        runner.toLowerCase()
    ],
    timeout: 1000000,
    standard: standard.replace(' 2.0 ','2')
}

if (!fs.existsSync('config/token.json')){
  //set up Google APIs, etc.
  if (!fs.existsSync('config')){
    fs.mkdirSync('config');
  }
  googleAPI.createGoogleDoc('Pa11y Setup', 'It works!');
} else {

  // Globals, will be manipulated by multiple functions.
  const AllResults = [];
  let tests = [];


  /**
  * Recursive function to run Pa11y on the global list of tests.
  * @param {integer} i - index of the current test to be run.
  * @param {function} cb - The callback to be executed after the last test is complete.
  */
  function pa11yTest(i, cb){
    var test = tests[i];
    console.log(`(${i+1} / ${tests.length}) Testing ${test.url} using ${config.runners[0]} and ${config.standard} standards...`);
    return pa11y(test.url, config).then((results) => {
      AllResults.push({
        "test": test,
        "result": results
      });
      // pa11yTable(results.issues, test); // adds to global #{Rows}
      if (i < tests.length - 1){
        // keep building
        pa11yTest(i+1, cb);
      } else {
        // call the callback
        cb();
      }
    });
  }

  /**
  * Generate current date as YYYY-MM-DD
  */
  function dateStamp(){
    var d = new Date();
    var dateStamp = d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2, '0')+'-'+(d.getDay().toString().padStart(2, '0'));
    return dateStamp;
  }

  /**
  * Create consistent file names based on client name and the current date
  * @param {string} client - Client name.
  * @param {string} path - Path to preceed the generated filename.
  * @param {string} ext - The file extension to end the filename.
  */
  function fileName(client, path, ext){
    if (!fs.existsSync(path)){
      fs.mkdirSync(path);
    }
    var dateStamp = dateStamp();

    var filename = path+client.toLowerCase()+'-a11y-'+dateStamp+'.'+ext.replace('.','');
    return filename;
  }

  /**
  * callback to save data and create the report.
  * Saves data to JSON file
  * Generates the report
  * Saves report to HTML file
  * Writes report to Google Docs
  */
  function saveDataCreateReport() {
    console.log('Writing data to JSON...');
    const jsonFile = fileName(client,'results/','json');
    fs.writeFileSync(jsonFile, JSON.stringify(AllResults));
    console.log(`Created ${jsonFile}`);

    console.log('Creating A11y report...');
    var data = mapReportData(AllResults);
    var report = reportHTML(data, tests, client, runner, standard);
    var dateStamp = dateStamp();
    var name = `${client} Accessibility Audit ${dateStamp}`;

    console.log('Writing report to HTML...');
    const htmlFile = fileName(client,'reports/','html');
    fs.writeFileSync(htmlFile, report);
    console.log(`Created ${htmlFile}`);

    console.log('Creating Google Doc...');
    googleAPI.createGoogleDoc(name, report);
  }

  /**
  * Test a list of defined urls
  * @param {string} list - path to a local JSON file of urls to test.
  */
  function pa11yTestList(list){
    tests = JSON.parse(fs.readFileSync(list, {encoding:'utf8', flag:'r'}));
    if (tests.length > 0) {
      pa11yTest(0, saveDataCreateReport);
    } else {
      console.log("No tests specified");
    }
  }

  /**
  * Test a remote sitemap
  * @param {string} sitemap - URL of the sitemap to test.
  */
  function pa11yTestSiteMap(sitemap){

    var saveURLs = function(url){

      //global tests
      tests.push({
        url: url,
        page: ''
      });
    }
    sitemapParser.parseSitemaps(sitemap, saveURLs, function(err, sitemapParser) {
      pa11yTest(0, saveDataCreateReport);
    });
  }

  // The good stuff. Start your tests here:
  const client = 'NICB';
  pa11yTestList('./clients/nicb.json');
  // pa11yTestSiteMap('https://client.com/sitemap.xml');
}
