const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // Eliminadas las opciones obsoletas
    console.log(`MongoDB conectado: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error al conectar con MongoDB: ${error.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
