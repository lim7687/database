const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const port = 3000;
const app = express();
app.use(express.json());

let db;

async function connectToMongoDB() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");
        db = client.db("testDB"); // The database is still 'testDB', but the collection is 'usersapp'
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
}
connectToMongoDB();

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

// GET all users from the 'usersapp' collection
app.get('/usersapp', async (req, res) => {
    try {
        const users = await db.collection('usersapp').find().toArray();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// GET a specific user by ID from the 'usersapp' collection
app.get('/usersapp/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await db.collection('usersapp').findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "Error fetching user" });
    }
});

// POST - Create a new user in the 'usersapp' collection
app.post('/usersapp', async (req, res) => {
    try {
        const { name, email, role } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await db.collection('usersapp').insertOne({ name, email, role });
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ error: "Invalid user data" });
    }
});

// PATCH - Update user details in the 'usersapp' collection
app.patch('/usersapp/:id', async (req, res) => {
    try {
        const result = await db.collection('usersapp').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "User not found or no changes made" });
        }

        res.status(200).json({ updated: result.modifiedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid user ID or data" });
    }
});

// DELETE - Remove user from the 'usersapp' collection
app.delete('/usersapp/:id', async (req, res) => {
    try {
        const result = await db.collection('usersapp').deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ deleted: result.deletedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid user ID" });
    }
});

/*
//additional PUT
// PUT /rides/:id - Update the ride
app.put('/rides/:id', async (req, res) => {
    const rideId = req.params.id;

    // Ensure the ID is valid
    if (!ObjectId.isValid(rideId)) {
        return res.status(400).json({ error: "Invalid ride ID" });
    }

    // Destructure the fields we expect to update
    const { status, pickupLocation, destination, driverId } = req.body;

    // Check that at least one of the fields is provided
    if (!status && !pickupLocation && !destination && !driverId) {
        return res.status(400).json({ error: "At least one field must be provided to update" });
    }

    const updatedFields = {};

    // Add fields to the update object if provided
    if (status) updatedFields.status = status;
    if (pickupLocation) updatedFields.pickupLocation = pickupLocation;
    if (destination) updatedFields.destination = destination;
    if (driverId) updatedFields.driverId = driverId;

    try {
        // Update the ride document in MongoDB
        const result = await db.collection('rides').updateOne(
            { _id: new ObjectId(rideId) },
            { $set: updatedFields }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Ride not found or no changes made" });
        }

        res.status(200).json({ updated: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: "Failed to update ride" });
    }
});
*/
/*
Test all 5 endpoints in Postman:

POST /users – create a user

GET /users – list all users

GET /users/:id – get a specific user

PATCH /users/:id – update something like name/role

DELETE /users/:id – delete a user
*/