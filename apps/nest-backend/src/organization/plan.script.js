import { MongoClient, ObjectId } from "mongodb";

const uri = 'mongodb+srv://Jayant:Be92XVT2eWlYBlen@cluster0.aank9iq.mongodb.net/bugChecker?retryWrites=true&w=majority&appName=Cluster0'
const dbName = 'bugChecker';

const data = [
    {
        name: 'trial',
        price: 0,
        reviewsGranted: 10,
        period: 'monthly',
        modelsAllowed: [
            {
                model: 'gemini-2.5-flash',
                quota: 10,
            }
        ]
    },
    {
        name: 'pro',
        price: 1500,
        reviewsGranted: 99,
        period: 'monthly',
        modelsAllowed: [
            {
                model: 'gemini-2.5-flash',
                quota: 99,
            },
            {
                model: 'claude-3-sonnet',
                quota: 50,
            }
        ]
    }
]

async function main() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to DB Successfully");

        const db = client.db(dbName);

        const planCollection = db.collection('Plans');


        for (plan of data) {
            await planCollection.insertOne(plan);
        }
    } catch (e) {
        console.error("Error", e);
    } finally {
        await client.close();
        console.log("Connection Closed!");
    }
}

main();