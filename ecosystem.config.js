module.exports = {
    apps: [
        {
            name: "Fileserver",
            script: "./server.js",
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                PORT: 3001,
                NODE_ENV: "production",
                BASE_URL: "https://fileservertemp.teratany.org",
                UPLOAD_DIR: "./files",
                MAX_FILE_SIZE: 50
            },
            autorestart: true,
            max_memory_restart: '500M',
            min_uptime: '10s',
            max_restarts: 10,
            restart_delay: 4000,
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true,
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
        }
    ]
}