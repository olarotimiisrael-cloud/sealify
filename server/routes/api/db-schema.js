import { readFileSync } from 'fs';
import path from 'path';

export default async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, '../../../src/admin/db-schema-generator.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/sql');
    res.send(sqlContent);
  } catch (err) {
    res.status(500).send('Error loading schema');
  }
};

// Add this route to your Nitro server configuration in vite.config.ts
// export const routes = [
//   { path: '/admin/db-schema', handler: dbSchemaHandler }
//];