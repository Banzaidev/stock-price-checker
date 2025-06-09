const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { test } = require('mocha');

chai.use(chaiHttp);
/* const gen_test_ip = () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}` */

suite('Functional Tests', function() {
    let likes;
    test("Viewing one stock: /api/stock-prices/ (GET)",(done)=>{
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG')
        .end((err,res)=> {
            if(err){
                return done(err)
            }
            assert.equal(res.body.stockData.stock, "GOOG")
            likes = res.body.stockData.likes
            return done()

        })
    })
    test("Viewing one stock and liking it: /api/stock-prices/ (GET)",(done)=>{
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&like=true')
        .end((err,res)=> {
            if(err){
                return done(err)
            }
            likes = likes + 1
            assert.equal(res.body.stockData.likes, likes)
            
            return done()

        })
    })
    test("Viewing the same stock and liking it again: /api/stock-prices/ (GET)",(done)=>{
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&like=true')
        .end((err,res)=> {
            if(err){
                return done(err)
            }
            assert.equal(res.body.stockData.likes, likes)
            return done()

        })
    })

    test("Viewing two stocks: /api/stock-prices/ (GET)",(done)=>{
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT')
        .end((err,res)=> {
            if(err){
                return done(err)
            }

            assert.equal(res.body.stockData[0].stock, "GOOG")
            assert.equal(res.body.stockData[1].stock, "MSFT")
            return done()

        })
    })
    let likesOBJ = {

    }
    test("Viewing two stocks and liking them: /api/stock-prices/ (GET)",(done)=>{
        chai.request(server)
        .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
        .end((err,res)=> {
            if(err){
                return done(err)
            }
            likesOBJ[res.body.stockData[0].stock] = res.body.stockData[0].rel_likes
            likesOBJ[res.body.stockData[1].stock] = res.body.stockData[1].rel_likes
            /* 
            the relative likes (rel_likes), which represent the difference between the two stocks' likes
             will remain the same because both stocks were liked equally */
            assert.equal(res.body.stockData[0].rel_likes,likesOBJ[res.body.stockData[0].stock])
            assert.equal(res.body.stockData[1].rel_likes,likesOBJ[res.body.stockData[1].stock])
            return done()

        })
    })

});
