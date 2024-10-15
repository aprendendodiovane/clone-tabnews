import database from "infra/database.js";

async function status(request, response) {
  let status = "unhealthy";

  const updatedAt = new Date().toISOString();

  const databaseVersion = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersion.rows[0].server_version;

  const databaseMaxConnections = await database.query("show max_connections;");
  const databaseMaxConnectionsValue = parseInt(
    databaseMaxConnections.rows[0].max_connections,
  );

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    databaseOpenedConnections.rows[0].count;

  if (
    databaseVersionValue &&
    databaseMaxConnectionsValue &&
    databaseOpenedConnectionsValue
  ) {
    status = "healthy";
  }

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        status: status,
        version: databaseVersionValue,
        max_connections: databaseMaxConnectionsValue,
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}

export default status;
