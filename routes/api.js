'use strict';

const bcrypt = require('bcrypt');

async function getDataFromAPI(symbol) {
  const apiData = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`).then(data => data.json())
  return apiData
}
async function getDataFromDB(symbol,db){
  let doc = await db.findOne({"symbol":symbol})
  if (!doc){
    doc = await db.create({"symbol": symbol})
  }
  return doc

}
async function likeStock(symbol,req,apiData,isLike,doc,db){
  let data = {
    "stockData": {"stock":symbol,"price":apiData.latestPrice,"likes":doc.likes.number_likes}
  }

  if (isLike == 'true'){
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    let isIPinDB = false
    for(const hashedIP of doc.likes.ip){
      const match = await bcrypt.compare(ip,hashedIP)
      if(match){
        isIPinDB = true
        break
      }
    }
    if(!isIPinDB){
      data.stockData.likes =  data.stockData.likes + 1
      let ips = doc.likes.ip
      ips.push(await bcrypt.hash(ip,10))
      await db.findOneAndUpdate({"symbol": symbol}, {"likes.number_likes": data.stockData.likes, "likes.ip":ips})
    }
        
  }
  return data
}

async function fetchAndUpdateStock(symbol,db,req,isLike){
  let stock = await getDataFromAPI(symbol)
  let doc = await getDataFromDB(symbol,db)
  let data = await likeStock(symbol,req,stock,isLike,doc,db)
  return data 
}

module.exports = function (app,db) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      let symbols = req.query.stock
      let isLike = req.query.like
      if((isLike != 'true' && isLike != 'false') && isLike != undefined){
        return res.status(400).send('should be true or false')
      }
      if(Array.isArray(symbols)){
        let data = {"stockData":[]}
        const dataPre = await fetchAndUpdateStock(symbols[0],db,req,isLike)
        const dataPost = await fetchAndUpdateStock(symbols[1],db,req,isLike)
        data['stockData'].push({"stock":dataPre.stockData.stock, "price":dataPre.stockData.price, "rel_likes":dataPre.stockData.likes - dataPost.stockData.likes})
        data['stockData'].push({"stock":dataPost.stockData.stock, "price":dataPost.stockData.price, "rel_likes":dataPost.stockData.likes - dataPre.stockData.likes})
        return res.json(data)
      }
      const data = await fetchAndUpdateStock(symbols,db,req,isLike)
      res.json(data)
    });
    
};
