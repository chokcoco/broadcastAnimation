var connections = [];

onconnect = function (event) {
  var port = event.ports[0];
  connections.push(port);

  port.onmessage = function (event) {
    // 接收到消息时，向所有连接发送该消息
    connections.forEach(function (conn) {
      if (conn !== port) {
        conn.postMessage(event.data);
      }
    });
  };

  port.start();
};