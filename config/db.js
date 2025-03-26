const mongoose = require('mongoose')

const dbConnect = () => {
    const db_url = process.env.MONGO_URI
    mongoose.set('strictQuery', false)

    try{
        mongoose.connect(db_url)
    }catch(error){
        console.err("Error conectando a la BD:", error)
    }

    mongoose.connection.on("connected",() => console.log("Conectado a la BD"))
}

module.exports = dbConnect
