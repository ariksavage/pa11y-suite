const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const open = require('open');

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/script.projects'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'config/token.json';
const CREDENTIALS_PATH = 'config/credentials.json';

/**
* Completes google authorization and then completes the provided callback
* @param {function} cb - function takes two parameters(auth, args)
* @param {object} args - an object containing any necessary arguments for the cb function
*/
function googleAPI(cb, args){
  // Load client secrets from a local file.
  if (!fs.existsSync(CREDENTIALS_PATH)){
    console.log('Visit https://developers.google.com/docs/api/quickstart/nodejs');
    console.log('Click the button in Step 1 to create a new Cloud Platform project and automatically enable the Google Docs API.');
    console.log('PROJECT NAME: Sandstorm Pa11y');
    console.log('CONFIGURE YOUR OAUTH CLIENT: Desktop App');
    console.log('In resulting dialog click DOWNLOAD CLIENT CONFIGURATION and save the file credentials.json to the config directory.');
    return;
  } else {
    fs.readFile(CREDENTIALS_PATH, (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Docs API.

      var auth = authorize(JSON.parse(content), cb, args);
    });
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 * @param {arguments} arguments to be passed into the callback as a single argument.
 */
function authorize(credentials, callback, arguments) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, arguments);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
function printDocTitle(auth) {
  const docs = google.docs({version: 'v1', auth});
  docs.documents.get({
    documentId: '195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log(`The title of the document is: ${res.data.title}`);
  });
}

/**
* Creates a new Google document
* @param {object} auth - the auth token created in the above authorize() function
* @param {arguments} arguments to be passed into the callback as a single argument.
* Arguments expected: title, body, cb
*/
function createDoc(auth, args){
  const drive = google.drive({ version: "v3", auth });
  const script = google.script({ version: "v1", auth });

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  drive.files.create(
    {
      requestBody: {
        name: args.title,
        mimeType: "application/vnd.google-apps.document"
      },
      media: {
        mimeType: args.type,
        body: args.body
      }
    },
    (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
          if(typeof args.cb == 'function'){
            args.cb(res);
          };
      script.projects.create(
        {
          requestBody: {
            title: args.title,
            parentId: res.data.id
          }
        },
        (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          script.projects.updateContent(
            {
              scriptId: res.data.scriptId,
              auth,
              resource: {
                files: [
                  {
                    name: "Code",
                    type: "SERVER_JS",
                    source: 'A11y Script'
                  },
                  {
                    name: "appsscript",
                    type: "JSON",
                    source:
                      `{"timeZone":"${tz}","exceptionLogging":"STACKDRIVER"}`,
                  }
                ]
              }
            },
            (err, res) => {
              if (err) {
                return;
              }
            }
          );
        }
      );
    }
  );
}

/**
* Converts params into arguments for createDoc()
* @param {string} title - Document title
* @param {string} body - Document body
* @param {string} type - The mime type of the body
*/
function createGoogleDoc(title, body, type = 'text/html'){
  const args = {
    body: body,
    title: title,
    type: type
  };

  const createDocCb = function(res){
    const docUrl = `https://docs.google.com/document/d/${res.data.id}`;
    console.log(`Document created: ${docUrl}`);
    open(docUrl);
  }
  args.cb = createDocCb;

  googleAPI(createDoc, args);
}

exports.createGoogleDoc = createGoogleDoc;
