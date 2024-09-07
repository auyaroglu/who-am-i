import { MongoClient, Db } from "mongodb"
import dotenv from "dotenv"

dotenv.config()

const uri = process.env.DATABASE_URI || ""
const client = new MongoClient(uri)
let db: Db

export const connectToDatabase = async (): Promise<Db> => {
    if (!db) {
        await client.connect()
        db = client.db("whoamidb")
        console.log("Connected to MongoDB")
    }
    return db
}
