let { google } = require('googleapis');

module.exports = function (RED) {
  function gSheet(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    try {
      this.creds = JSON.parse(RED.nodes.getNode(config.creds).credentials.creds);
    } catch (err) {
      node.error("Invalid credentials: " + err.message);
      return;
    }
    
    this.method = config.method;
    this.flatten = config.flatten;
    
    node.on('input', function (msg) {
      if (!config.sheet) {
        this.sheet = msg.sheet;
      } else {
        this.sheet = config.sheet;
      }
      if (!config.cells) {
        if (msg.cells) {
          this.cells = msg.cells;
        }
      } else {
        this.cells = config.cells;
      }
      let jwtClient = new google.auth.JWT(
        this.creds.client_email,
        null,
        this.creds.private_key,
        [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive'
        ]
      );
      let sheet = this.sheet;
      let cells = this.cells;
      let method = this.method;
      let flaten = this.flatten;
      let sheets = google.sheets('v4');
      jwtClient.authorize(function (err, tokens) {
        if (err) {
          node.error("Auth Error: " + err);
          return;
        } else {
          switch (method) {
            case 'get':
              sheets.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: sheet,
                range: cells
              }, function (err, response) {
                if (err) {
                  node.error('The API returned an error: ' + err, msg);
                } else {
                  if (flaten) {
                    msg.payload = response.data.values.flat();
                  } else {
                    msg.payload = response.data.values;
                  }
                  node.send(msg);
                }
              });
              break;
            case 'append':
              if (Array.isArray(msg.payload)) {
                if (Array.isArray(msg.payload[0])) {
                  msg.payload = { "values": msg.payload }
                } else {
                  msg.payload = { "values": [msg.payload] }
                }
              } else {
                msg.payload = { "values": [[msg.payload]] }
              }
              sheets.spreadsheets.values.append({
                auth: jwtClient,
                spreadsheetId: sheet,
                range: cells,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                resource: msg.payload
              }, function (err, response) {
                if (err) {
                  node.error('The API returned an error: ' + err, msg);
                } else {
                  msg.payload = response.data.updates;
                  node.send(msg);
                }
              });
              break;
            case 'update':
              if (Array.isArray(msg.payload)) {
                if (Array.isArray(msg.payload[0])) {
                  msg.payload = { "values": msg.payload }
                } else {
                  msg.payload = { "values": [msg.payload] }
                }
              } else {
                msg.payload = { "values": [[msg.payload]] }
              }
              sheets.spreadsheets.values.update({
                auth: jwtClient,
                spreadsheetId: sheet,
                range: cells,
                valueInputOption: "USER_ENTERED",
                resource: msg.payload
              }, function (err, response) {
                if (err) {
                  node.error('The API returned an error: ' + err, msg);
                } else {
                  msg.payload = response.data;
                  node.send(msg);
                }
              });
              break;
            case 'clear':
              sheets.spreadsheets.values.clear({
                auth: jwtClient,
                spreadsheetId: sheet,
                range: cells,
              }, function (err, response) {
                if (err) {
                  node.error('The API returned an error: ' + err, msg);
                } else {
                  msg.payload = response.data;
                  node.send(msg);
                }
              });
              break;
            case 'createSheet':
              sheets.spreadsheets.batchUpdate({
                auth: jwtClient,
                spreadsheetId: sheet,
                resource: {
                  requests: [{
                    addSheet: {
                      properties: {
                        title: cells // New sheet title
                      }
                    }
                  }]
                }
              }, function (err, response) {
                if (err) {
                  node.error('The API returned an error: ' + err, msg);
                } else {
                  msg.payload = 'New sheet created: ' + cells;
                  node.send(msg);
                }
              });
              break;
            case 'deleteSheet':
              sheets.spreadsheets.get({
                auth: jwtClient,
                spreadsheetId: sheet,
                fields: 'sheets.properties.title,sheets.properties.sheetId'
              }, (err, res) => {
                if (err) {
                  node.error('Error retrieving sheet list: ' + err, msg);
                } else {
                  const sheetList = res.data.sheets;
                  const targetSheetName = cells; // Sheet name to delete
                  const targetSheet = sheetList.find(sheet => sheet.properties.title === targetSheetName);
                  if (targetSheet) {
                    const sheetId = targetSheet.properties.sheetId;
                    // Delete sheet by ID
                    sheets.spreadsheets.batchUpdate({
                      auth: jwtClient,
                      spreadsheetId: sheet,
                      resource: {
                        requests: [{ deleteSheet: { sheetId: sheetId } }]
                      }
                    }, (err, response) => {
                      if (err) {
                        node.error('Error deleting sheet: ' + err, msg);
                      } else {
                        msg.payload = 'Sheet deleted: ' + targetSheetName;
                        node.send(msg);
                      }
                    });
                  } else {
                    node.error('Sheet not found: ' + targetSheetName, msg);
                  }
                }
              });
              break;
              case 'downloadPDF': {
                let drive = google.drive('v3');
            
                drive.files.export(
                    {
                        auth: jwtClient,
                        fileId: sheet,
                        mimeType: 'application/pdf'
                    },
                    { responseType: 'stream' },
                    function (err, response) {
                        if (err) {
                            node.error('Error exporting sheet as PDF: ' + err, msg);
                            return;
                        }
            
                        let data = [];
                        response.data.on('data', chunk => data.push(chunk)); // Collect chunks of data
            
                        response.data.on('end', () => {
                            msg.payload = Buffer.concat(data); // Combine all chunks into a single buffer
                            node.send(msg); // Send the file buffer to the next node
                        });
            
                        response.data.on('error', err => {
                            node.error('Error reading PDF stream: ' + err, msg);
                        });
                    }
                );
            }
            break;
            
            case 'downloadXLS': {
                let drive = google.drive('v3');
            
                drive.files.export(
                    {
                        auth: jwtClient,
                        fileId: sheet,
                        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                    { responseType: 'stream' },
                    function (err, response) {
                        if (err) {
                            node.error('Error exporting sheet as XLS: ' + err, msg);
                            return;
                        }
            
                        let data = [];
                        response.data.on('data', chunk => data.push(chunk));
            
                        response.data.on('end', () => {
                            msg.payload = Buffer.concat(data); 
                            node.send(msg); 
                        });
            
                        response.data.on('error', err => {
                            node.error('Error reading XLS stream: ' + err, msg);
                        });
                    }
                );
            }
            break;      
            default:
              node.error('Invalid method specified', msg);
              break;
          }
        }
      });
    });
  }

  function gauth(n) {
    RED.nodes.createNode(this, n);
    this.creds = n.creds;
  }
  RED.nodes.registerType("GSheetAdvance", gSheet);
  RED.nodes.registerType("gauthAdv", gauth, {
    credentials: {
      creds: { type: "text" }
    }
  });
};

function flatten(arr) {
  if (arr.length == 1 && arr[0].length == 1) {
    return arr[0][0];
  } else if (arr.length != 1 && arr[0].length == 1) {
    return arr.reduce((acc, val) => acc.concat(val), []);
  } else if (arr.length == 1 && arr[0].length != 1) {
    return arr.reduce((acc, val) => acc.concat(val), []);
  } else {
    return arr;
  }
}