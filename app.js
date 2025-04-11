const express=require('express');
const { MongoClient, ObjectId } = require('mongodb');

const port=3000

const app=express();
app.use(express.json());

let db;

async function connectToMongoDB(){
    const uri="mongodb://localhost:27017";
    const client= new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");
        db = client.db("testDB");

        
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
}
connectToMongoDB(); // ✅ Call it!
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

//GET/rides -Fetch all rides
app.get('/rides', async (req,res)=> {
    try{
        const rides=await db.collection ('rides').find().toArray();
        res.status(200).json(rides);
    }catch (err){
        res.status(500).json({error:"Failed to fetch rides"});
    }
});
//additional double check with specific id
app.get('/rides/:id', async (req, res) => {
    try {
        const rideId = req.params.id;
        const ride = await db.collection('rides').findOne({ _id: new ObjectId(rideId) });

        if (!ride) {
            return res.status(404).json({ error: "Ride not found" });
        }

        res.status(200).json(ride);
    } catch (err) {
        res.status(500).json({ error: "Error fetching ride" });
    }
});

//POST /rides -Create a new ride

    app.post('/rides', async (req, res) => {
        /*
        console.log("Received body:", req.body);  // Log what’s coming through
    
        const { user, destination, status } = req.body;
        if (!user || !destination || !status) {
            return res.status(400).json({ error: "Missing required fields" });
        }
    */
    try{
        const result=await db.collection ('rides').insertOne(req.body);
        res.status(201).json ({id:result.insertedId});

    }catch (err){
        res.status(400).json({error:"Invalid ride data"});
        
    }
});


//PATCH/rides/:id -update ride status
app.patch('/rides/:id',async (req,res)=>{
    try{
        const result =await db.collection ('rides').updateOne(
            {_id: new ObjectId (req.params.id)},
            {$set:{status:req.body.status}}
        );

        if (result.modifiedCount===0){
            return res.status(404).json ({error:"Ride not found"});
        }
        res.status(200).json({updated:result.modifiedCount});
    }catch (err){
        //handle invalid id format or db error
        res.status(400).json({error:"Invalid ride ID or data"});
    }
});

//DELETE/rides/:id - Cancel a ride
app.delete('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').deleteOne(
            { _id: new ObjectId(req.params.id) }  // Ensure the ID is converted to ObjectId
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Ride not found" });
        }

        res.status(200).json({ deleted: result.deletedCount });
    } catch (err) {
        // Handle invalid ID format or DB error
        res.status(400).json({ error: "Invalid ride ID" });
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