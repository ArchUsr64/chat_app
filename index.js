const http = require("http");
const fs = require("fs");
const host = "localhost";
const port = 8080;
const db_path = "database";

const request_listener = function(req, res) {
  let mail = null;
  let message = null;
  let anonymize = false;
  try {
    const url = new URL(`http://example.com/${req.url}`);
    mail = url.searchParams.get("mail");
    message = url.searchParams.get("message");
    anonymize = !! url.searchParams.get("anonymize");
  } catch (_) {
  }
  if (mail && message) {
    data = {mail, message};
    if (anonymize)
      data.mail = "Anonymous";
    fs.appendFileSync(db_path, `${JSON.stringify(data)}\n`);
  };
  let db_parsed = read_database(db_path)
  res.writeHead(200);
  res.end(generate_html(db_parsed));
}

function read_database(path) {
  let data = fs.readFileSync(path).toString();
  let parsed_data = []
  data.split('\n').forEach(line => {
    if (line.length > 1) {      
      parsed_data.push(JSON.parse(line));
  }})
  return parsed_data
} 

function generate_html(data){
  const raw_html = fs.readFileSync("index.html").toString()
  let injected_html = ""
  raw_html.split('\n').forEach(line => {
    if (line.includes("injection_point")) {
      injected_html += `let data = ${JSON.stringify(data)}`
    } else 
      injected_html += line;
      injected_html += "\n";
  })
  return injected_html
}

const server = http.createServer(request_listener);

server.listen(port, host, () => console.log(`Server is running on http://${host}:${port}`));
