
const { MongoClient , Decimal128} = require('mongodb');

const drivers=[
    {
        "name":"John Doe",
        "vehicleType":"Sedan",
        "isAvailable":true,//boolean data type
        "rating":4.8//num data type
    },

    {
        "name":"Alice Smith",
        "vehicleType":"SUV",
        "isAvailable":false,
        "rating":4.5
    }
]
console.log(drivers);
//add drivers to drivers array
var newdriver=
    {
        "name":"Jennie Ruby",
        "vehicleType":"Tesla",
        "isAvailable":true,
        "rating":5.0
    }
drivers.push(newdriver);
console.log(drivers);

//show all driver name in console
drivers.forEach(element=>{
    console.log(element.name);//driver
});

//Part2
async function main() {
    // Replace <connection-string> with your MongoDB URI
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);
    

    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        const db = client.db("testDB");
        const driversCollection = db.collection("drivers");

//insert doc
        
        for (const element of drivers) {
            const result = await driversCollection.insertOne(element);//element=each object in drivers
            console.log(`New driver created with result ${result.insertedId}`);
        }
        /*
//insertMany
       
        const result = await driversCollection.insertMany(drivers);
        console.log("Number of Documents Inserted:", result.insertedCount);
        console.log("New driver created with result IDs:", result.insertedIds);
        */
       
// Find available and rating up 4.5
        const availableDrivers=await db.collection('drivers').find({
            isAvailable:true,
            rating:{$gte: 4.5}
        }).toArray();
        console.log("Available ddrivers:",availableDrivers);//line68
  
//   updateOne   
        //update John rating by 0.1//but $inc bring float num ,apply NumberDecimal
        const updateResult = await db.collection('drivers').updateOne(
            { name: "John Doe" },
            { $set: { rating: Decimal128.fromString("4.9") } }//NumberDecimal is not defined in Node.js. 
        );

        console.log(`Driver updated with key:'${updateResult.matchedCount}`);
        console.log(`Driver updated with result:'${updateResult.modifiedCount}`);

        //show the successffully update doc 
        if (updateResult.modifiedCount > 0) {
            console.log("Update successful! Fetching updated document...");
            const updatedDoc = await db.collection('drivers').findOne({ name: "John Doe" });
            console.log("Updated Document:", updatedDoc);//update with same ID with previous
        } else {
            console.log("No document was updated.");
        }

/*  //updateMany (all doc)
        const updateResult = await db.collection('drivers').updateMany(
            {},//all doc
            { $set: { rating: Decimal128.fromString("4.9") } }//NumberDecimal is not defined in Node.js. 
        );
        console.log(`Driver updated with key:'${updateResult.matchedCount}`);
        console.log(`Driver updated with result:'${updateResult.modifiedCount}`);
*/
//count total before delete got how many doc 
        const totalDrivers = await db.collection('drivers').countDocuments(); // Count all drivers
        console.log(`Total drivers before deletion: ${totalDrivers}`);

//store unavailable driver and delete unavailable driver
        const deletedDoc = await db.collection('drivers').findOne({ isAvailable: false });//backup print what dlt
        if (deletedDoc) 
        {
            //i print the deletion first, if print afterward a little bit no logic
            console.log("Driver to be deleted:", deletedDoc);

            //really delete
            const deletedResult=await db.collection('drivers').deleteOne({isAvailable:false})
            console.log(`Driver deleted with result:${deletedResult.deletedCount}`);

        
        

// Check if all drivers were deleted
        const remainingDrivers = await db.collection('drivers').countDocuments(); // Count remaining drivers

        if (remainingDrivers === 0) 
        {
                console.log("All drivers have been successfully deleted! Database is now empty.");
        } 
         else {
            console.log(`Deletion successful! ${remainingDrivers} drivers still exist.`);
              }
        } else {
            console.log("No matching drivers found for deletion.");
                }       

/*deleteMany 
        store unavailable driver and delete unavailable driver
        const deletedDoc = await db.collection('drivers').findOne({ isAvailable: false });//backup print what dlt
        if (deletedDoc) 
            {
            console.log("Driver to be deleted:", deletedDoc);//i print the deletion first, if print afterward a little bit no logic
            const deletedResult=await db.collection('drivers').deleteMany({isAvailable:false})//really delete
            console.log(`Driver deleted with result:${deletedResult.deletedCount}`);
*/
        
        /*Once a document is deleted, you cannot retrieve it from MongoDB using findOne(). 
        It is permanently removed. you can fetch it before deleting.*/
/*      
// Check if all drivers were deleted
        const remainingDrivers = await db.collection('drivers').countDocuments(); // Count remaining drivers

        if (remainingDrivers === 0) 
        {
                console.log("All drivers have been successfully deleted! Database is now empty.");
        } 
         else {
            console.log(`Deletion successful! ${remainingDrivers} drivers still exist.`);
              }
        } else {
            console.log("No matching drivers found for deletion.");
                }       
*/
    } finally {
        await client.close();
    }
}

main();


