'use strict';
module.exports = function (app,db) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
/*       db.create({symbol: 'test'}) */
      let symbol = req.query.stock
      let isLike = req.query.like
      if((isLike != 'true' && isLike != 'false') && isLike != undefined){
        return res.status(400).send('should be true or false')
      }
      const apiData = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`).then(data => data.json())
      let data = {
        "stockData": {"stock":apiData.symbol,"price":apiData.latestPrice,"likes":0}
      }
      if (isLike == 'true'){
        data.stockData.likes =  data.stockData.likes + 1
      }
      res.json(data)
    });
    
};
