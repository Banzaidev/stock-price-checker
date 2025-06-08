'use strict';

const bcrypt = require('bcrypt');

module.exports = function (app,db) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      let symbol = req.query.stock
      let isLike = req.query.like
      if((isLike != 'true' && isLike != 'false') && isLike != undefined){
        return res.status(400).send('should be true or false')
      }
      const apiData = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`).then(data => data.json())
      let doc = await db.findOne({"symbol":symbol})
      if (!doc){
        doc = await db.create({"symbol": symbol})
      }
      let data = {
        "stockData": {"stock":apiData.symbol,"price":apiData.latestPrice,"likes":doc.likes.number_likes}
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
      res.json(data)
    });
    
};
