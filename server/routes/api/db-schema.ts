import { defineHandler } from "nitro";
import { readFileSync } from 'fs';
import path from 'path';

export default defineHandler(async (event) => {
  try {
    const sqlPath = path.join(process.cwd(), 'src/admin/db-schema-generator.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    event.node.res.setHeader('Content-Type', 'text/sql');
    event.node.res.setHeader('Content-Disposition', 'attachment; filename="sealify-schema.sql"');
    return sqlContent;
  } catch (err) {
    return event.node.res.status(500).send('Error loading schema');
  }
});