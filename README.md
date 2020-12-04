# Sandstorm Pa11y

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
