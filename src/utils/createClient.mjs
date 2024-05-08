import { connect } from "mqtt"
import global from "../global-variables.mjs"


export default function createClient(protocol) {
  const options = {
    username: global.username,
    password: global.password
  }
  let serverUri;
  if (protocol === 'tcp' || protocol === undefined) {
    serverUri = global.tcp_uri
  } else if (protocol === 'ws') {
    serverUri = global.ws_uri
  } else {
    throw "Protocol is 'tcp' or 'ws'!"
  }

  const client = connect(serverUri, options)
  return client
}