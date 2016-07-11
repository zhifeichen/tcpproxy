/**
 * Created by zhifei on 16/7/8.
 */
"use strict";
const net = require('net');
const config = require('./config.json');

var servers = [];
for(const p in config) {
    if(config.hasOwnProperty(p)) {
        const device = config[p];
        const server = net.createServer((client) => {
            console.log(`client (${client.remoteFamily})${client.remoteAddress}:${client.remotePort} connected.`);
            const proxy = net.createConnection({port: device.port, host: device.ip});
            client.pipe(proxy).pipe(client);

            client.on('close', () => {
                console.log(`client(${client.remoteAddress}:${client.remotePort}) disconnect`);
                client.unpipe();
                if(!proxy.destroyed){
                    proxy.unpipe();
                    proxy.end();
                }
            });
            client.on('error', (err) => {
                console.log(`client(${client.remoteAddress}:${client.remotePort}) error: ${err.code}`);
                client.unpipe();
                if(!proxy.destroyed){
                    proxy.unpipe();
                    proxy.end();
                }
            })

            proxy.on('close', () => {
                console.log('proxy disconnect');
                proxy.unpipe();
                if(!client.destroyed){
                    client.unpipe();
                    client.end();
                }
            });
            proxy.on('error', (err) => {
                console.log(`proxy error: ${err}`);
                proxy.unpipe();
                if(!client.destroyed){
                    client.unpipe();
                    client.end();
                }
            })
        });

        server.on('error', (err) => {
            console.log(`start server error: ${err.code}`);
        })
        server.listen(p, '0.0.0.0', () => {
            console.log('server listening ', p);
        });
    }
}