# ghoma-http-gateway
Control G-Homa plugs over HTTP.

Inspired by [this](https://github.com/rodney42/node-ghoma) project.

## Home Assistant integration
```yaml
switch:
  - name: ghoma_switch
    platform: rest
    resource: http://GATEWAY_ADDRESS:3000/ghoma/state/YOUR_PLUG_ID
    body_on: '{"on": true}'
    body_off: '{"on": false}'
    is_on_template: '{{ value_json.on }}'
    headers:
      Content-Type: application/json
```
