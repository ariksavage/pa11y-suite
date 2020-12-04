# Sandstorm Pa11y

## Initial Setup
Run the script.
```$ node index```
If you haven't already created a credentials.json file:
1. Visit https://developers.google.com/docs/api/quickstart/nodejs
2. Click the button in Step 1 to create a new Cloud Platform project and automatically enable the Google Docs API.
-- PROJECT NAME: Sandstorm Pa11y
-- CONFIGURE YOUR OAUTH CLIENT: Desktop App
3. In resulting dialog click DOWNLOAD CLIENT CONFIGURATION and save the file credentials.json to the config directory.
4. Copy the credentials.json to the configuration folder in this project.
Authorize the app.
1. Run the script again: ```$ node index```
2. Visit the URL that was generated.
3. Sign in via Google and authorize.
4. Copy the code, and paste in the terminal prompt.
1. Run the script again: ```$ node index```

## TROUBLESHOOTING
If you get an error like this:

```GaxiosError: Access Not Configured. Drive API has not been used in project [project id] before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=[project id] then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.```

Just visit the URL provided, and enable the API. Wait a few minutes, make a cup of coffee, then try again.

## Run your tests.
### First Round.
The first round of an Accessibility audit is to identify issues at the template level. In order to do this, we first test a representative sample of pages; for Drupal, this can be 1 page of each content type.
1. Create a client file, if it doesn't already exist:
clients/[client-name].json
```
[
  {
    "page": "Home page",
    "url": "https://[client].com"
  },
  {
    "page": "A content type",
    "url": "https://[client].com/example-page.html"
  },
  ...
]
```
2. Then at the bottom of the index.js: 
3. Update the client variable
4. Uncomment / update ```pa11yTestList(`./clients/[client].json`)```;
5. Comment out the ```pa11yTestSiteMap``` function if necessary.
6. Run the script: ```$ node index```;
7. Wait.
8. If all goes well, a new google doc will open in your default browser.
9. Read through the doc and update as necessary.

### Full Site Scan.
After the representative issues have been addressed, a full site scan can be performed, to catch the one-offs.

1. Then at the bottom of the index.js: 
2. Update the client variable
3. Uncomment / update ```pa11yTestSiteMap('https://client.com/sitemap.xml')```;
4. Comment out the ```pa11yTestList``` function if necessary.
5. Run the script: ```$ node index```;
6. Wait Longer this time. There are probably a lot more pages to scan.
7. If all goes well, a new google doc will open in your default browser.
8. Read through the doc and update as necessary.

## File Tree
- clients/ : json files for each client to test.
- config/ : stores google auth token and credentials
- reports/ : Generated HTML files
- results/ : JSON test results

## Component Modules
### report.js
Parse raw pa11y data into usable objects, and generate an HTML report.
### html.js
Helper functions to normalize writing HTML in JS.
### google.js
Wrapper for functions to create Google Docs

## index.js
```pa11yTestList(list)```
First round test, generally this is a list of representative pages for all content types of the site.

```list```: Path to a JSON file of sites to test, eg./clients/${client.toLowerCase()}.json
JSON should take the format of:
```
[
  {
    "page": "PAGE NAME",
    "url": "FULL URL"
  },
  ...
]
```

```pallyTestSiteMap(sitemap)```
Second round testing, tests a complete sitemap. All pages must be accessible by anonymous bots
```sitemap```: URL to an XML sitemap, eg https://clientsite.com/sitemap.xml
