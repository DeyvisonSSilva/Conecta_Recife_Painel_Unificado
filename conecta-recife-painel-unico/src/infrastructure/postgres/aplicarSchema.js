'use strict';
const fs = require('fs');
const path = require('path');
async function aplicarSchema(pool) { await pool.query(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'db', 'schema.sql'), 'utf8')); }
module.exports = { aplicarSchema };
