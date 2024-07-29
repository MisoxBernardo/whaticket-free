module.exports = {
  apps: [
    {
      name: "whaticket-backend",
      script: "./backend/dist/server.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 8081
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 8081
      }
    },
    {
      name: "whaticket-frontend",
      script: "serve",
      args: "-s build",
      cwd: "./frontend",
      watch: true,
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development"
      }
    }
  ]
};
