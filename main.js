/**
 * ghoma-http-gateway exposes the following API
 *
 * GET  http://your-server-address:3000/ghoma            Displays a list of all registered G-Homa Wi-Fi plugs
 * GET  http://your-server-address:3000/ghoma/ID         Current state of a plug
 * POST http://your-server-address:3000/ghoma/ID         Switch a plug on/of by sending json payload {"on": true} or {"on": false}
 * GET  http://your-server-address:3000/ghoma/ID/info    Current info of a plug
 *
 * NOTE: Replace ID with the short mac, that can be retrieved by the 'list' call (/ghoma).
 */
const ghoma = require('ghoma');
const express = require('express');
const app = express();
const router = express.Router();
const gatewayHttpPort = process.env.GHOMA_GATEWAY_PORT || 3000; // http server listening port
const controlServerPort = process.env.GHOMA_CONTROL_SERVER_PORT || 4196;   // G-Homa default port
const basePath = process.env.GHOMA_GATEWAY_BASE_PATH || '/ghoma';   // base path

app.use(express.json()); // use json middleware
app.use(basePath, router); // add base path to the app

// Uncomment this line to get a detailed log output
// ghoma.log = console.log;

/**
 * List all registered plugs.
 */
router.get('/', function (req, res) {
  var plugs = [];
  ghoma.forEach(function (plug) { plugs.push(plug); });
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(plugs));
});

/**
 * Switch a plug by id
 */
router.route('/state/:id').post(switchPlug).put(switchPlug);
function switchPlug(req, res) {
  var plug = ghoma.get(req.params.id);
  if (!plug) {
    res.status(404)
    res.send({ error: `unknown device ${req.params.id}` })
    return
  }
  var body = req.body;
  if (body.on === true) {
    console.log("turn on plug", plug.id)
    plug.on();
    res.send({ on: true })
  } else if (body.on === false) {
    console.log("turn off plug", plug.id)
    plug.off();
    res.send({ on: false })
  } else {
    res.sendStatus(400);
  }
}

/**
 * Retrieve the current state of a plug by id.
 */
router.get('/state/:id', function (req, res) {
  var plug = ghoma.get(req.params.id);
  if (!plug) {
    res.status(404)
    res.send({ error: `unknown device ${req.params.id}` })
    return
  }
  res.setHeader('Content-Type', 'application/json');
  var isOn = plug.state === "on"
  res.send({ on: isOn })
});

/**
 * Retrieve the current info of a plug by id.
 */
router.get('/info/:id', function (req, res) {
  var plug = ghoma.get(req.params.id);
  if (!plug) {
    res.status(404)
    res.send({ error: `unknown device ${req.params.id}` })
    return
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(plug));
});

// Called when new plug is registered
ghoma.onNew = function (plug) {
  console.log(`New plug registered. Address -> ${plug.remoteAddress}, ID -> ${plug.id}`);
}

// Called when the plug switches on or off
ghoma.onStatusChange = function(plug) {
  console.log(`Plug ${plug.id} (${plug.remoteAddress}) is ${plug.state}. Triggered ${plug.triggered}`);
}

// Start the ghoma control server listening server on this port
ghoma.startServer(controlServerPort);

// Start the express http server listening
app.listen(gatewayHttpPort, function () {
  console.log(`ghoma-http-gateway is listening on port ${gatewayHttpPort}, base path ${basePath}`);
});
