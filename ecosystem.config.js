module.exports = {
    apps: [
        {
            name: "Fileserver",
            script: "./server.js",
            instances: 'max',
            exec_mode: 'cluster',
            args: "start",
            env: {
                PORT: 5000,
                NODE_ENV: "production"
            },
            autorestart: true
        }
    ]
}