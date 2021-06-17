# CryptoCoins Price Stats
Created using CoinGeckos API<br>
    **JavaScript Code to Fetch api data**
     
     // Variables
    let BASE_URL = `https://api.coingecko.com/api/v3`;
    let COIN_DATA_ENDPOINT = `/coins/markets?vs_currency=nzd&order=market_cap_desc&per_page=${coinsPerPage}&page=${currentPage}&sparkline=false`;
    //Initlizing Function
    function getCoinData() {
    return fetch(coinUrl) // Get connection to api 
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            // print error to the console if not connecting
            console.log(error);
        });
        }
