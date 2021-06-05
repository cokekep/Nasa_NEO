const express = require('express'),
    router = express.Router();

module.exports = db => {
  const nasaNeo = require('../dal/neoData')(db)

  router.get('/probes/liveness',async (req,res)=>{
    res.status(200).send({'message':'Service Works'})
  })
  router.get('/v1/nasa/getNeo',async (req,res)=>{
    let nasaNeoData = await nasaNeo.getNasaNeoData();
    res.send(nasaNeoData)
  })

  router.get('/v1/nasa/insertNeo',async (req,res)=>{
    try{
      await nasaNeo.dropNasaDeoData();
      let nasaNeoData = await nasaNeo.getNasaNeoData();
      await nasaNeo.insertNasaNeoData(nasaNeoData);
      res.status(200).send({'message':'Data Fetched and Inserted Successfully'})
    }
    catch(err){
      console.log(err);
      res.status(400).send({'message':'Sorry, some error has occurred'})
    }

  })
  router.get('/v1/neo/week',async (req,res)=>{
    try{
      let neoCount = await nasaNeo.getNeoForWeek();
      res.status(200).send({'Total NEO in next seven days':neoCount})
    }
    catch(err){
      res.status(400).send({'message':'Sorry, some error has occurred'})
    }
    //res.send(response)
  })
  router.get('/v1/neo/next',async (req,res)=>{
    const isHazardous = req.query.hazardous == 'true'? true : false
    try{
      let nextNeo = await nasaNeo.getNextNeo(isHazardous);
      res.status(200).send(nextNeo)
    }
    catch(err){
      res.status(400).send({'message':'Sorry, some error has occurred'})
    }

  })
return router
};
