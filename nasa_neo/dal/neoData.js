const request = require('request');
const api_key = process.env.API_KEY;
// export the module
module.exports = db =>{
    let neoCollection = db.collection('neo');

    return {
        getNasaNeoData:function(){
            return new Promise((resolve,reject)=>{
                const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?&api_key=${api_key}`;
                request(apiUrl, function (err, response, body) {
                    if (err) return reject(err);
                    resolve(JSON.parse(body));
                });
            })
        },
// this function clears the existing data on db so that a new one can be fetched
        dropNasaDeoData:function(){
            return new Promise(async (resolve,reject)=>{
                let collections = await db.listCollections().toArray();
                const isNeo = collections.find(collection => collection.name === 'neo')
                if(isNeo){
                    neoCollection.drop().then(data=>{
                        resolve(true)
                    }).catch(err=>{
                        reject(err)
                    })
                }
                else{
                    resolve(true)
                }
             
            })
        },
// here the insert new data is done
        insertNasaNeoData:function(nasaNeoData){
            return new Promise((resolve,reject)=>{
             let neoDataToBeInsterted = []
// loop over JSON data
             for (const key in nasaNeoData.near_earth_objects){
                let processedNeoData = nasaNeoData.near_earth_objects[key].map(neoData =>{
                    return {
                        id:neoData.id,
                        name:neoData.name,
                        nasa_jpl_url:neoData.nasa_jpl_url,
                        is_potentially_hazardous_asteroid:neoData.is_potentially_hazardous_asteroid,
                        close_approach_date_full:new Date(neoData.close_approach_data[0].close_approach_date_full).toISOString(),
                        close_approach_date:new Date(key).toISOString()
                    }
                })
                neoDataToBeInsterted.push(processedNeoData)
             }
// format array to one level
             neoCollection.insertMany(neoDataToBeInsterted.flat()).then(data=>{
             resolve(neoDataToBeInsterted.flat())
             })

            })
            
        },
        getNeoForWeek:function(){
            return new Promise((resolve,reject)=>{
               const startDate = new Date();
               const endDate = new Date()
               endDate.setDate(endDate.getDate() + 7)

               neoCollection.find({
                close_approach_date:{
// convert date object to ISO string
                    $gte:startDate.toISOString(),
                    $lt:endDate.toISOString()
                }
               }).toArray()
               .then(data =>{
                   resolve(data.length)
               })
               .catch(err=>{
                   reject(err)
               })

            })
        },
        getNextNeo:function(isHazardous){
            return new Promise((resolve,reject)=>{
                const startOfDay = new Date();
                neoCollection.find({
                 close_approach_date_full:{
                    $gte:startOfDay.toISOString(),
                 },
                 is_potentially_hazardous_asteroid:isHazardous
                }).sort({close_approach_date_full:-1})
                .toArray()
                .then(data =>{
                    if(data)
                    resolve(data[0])
                    else
                    resolve({'message':'No NEO found in next 7 days'})
                })
                .catch(err=>{
                    reject(err)
                })
 
             })
        }
    }
}
