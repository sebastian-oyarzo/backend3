const express = require('express');
const cors = require('cors');
const app = express();
const { Pool } = require('pg');
const { key, PORT } = process.env;
const router = express.Router();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use('/', router);

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: key,
    database: 'likeme',
    allowExitOnIdle: true
});

const createTable = async () => {
    await pool.query(
        `
        CREATE TABLE IF  NOT EXISTS posts
        (id SERIAL, titulo VARCHAR(25), img VARCHAR(1000),
        descripcion VARCHAR(255), likes INT);
        `
    )
}

// al iniciar:
router.get('/posts', async (req, res) => {
    try{
        const getResponse = await pool.query(`SELECT * FROM posts; `);
        res.send(getResponse.rows);
    }
    catch(error){
        throw error;
    }
});

// al ejecutar la funcion agregarPost del frontend:
router.post('/posts', async (req, res) => {
    try {
      const { titulo, url, descripcion } = req.body;

      if (!titulo || !url || !descripcion) {
        return res.status(400).json({ error: 'Faltan uno o más campos requeridos' });
      }

      const queryText = `
        INSERT INTO posts (titulo, img, descripcion, likes)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values = [titulo, url, descripcion, 0];
      const getResponse = await pool.query(queryText, values);
      res.status(201).json(getResponse.rows[0]);
    } catch (error) {
      console.error('Error al insertar en la base de datos:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await createTable();
});