// Globals
let coinID = location.search.slice(1);
let coinsPerPage = 50;
let currentPage = 1;
let BASE_URL = `https://api.coingecko.com/api/v3`;
let MARKET_DATA_ENDPOINT = `/global`; // global Data API
let COIN_DATA_ENDPOINT = `/coins/markets?vs_currency=nzd&order=market_cap_desc&per_page=${coinsPerPage}&page=${currentPage}&sparkline=false`;
let COIN_DETAILS_ENDPOINT = `/coins/${coinID}?localization=true&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`;
let coinUrl = BASE_URL + COIN_DATA_ENDPOINT; // assign coingecko api coins markets to coinurl
let marketUrl = BASE_URL + MARKET_DATA_ENDPOINT; // set market data to marketurl
let detailsUrl = BASE_URL + COIN_DETAILS_ENDPOINT;
let sortOrder = {
    column: "market_cap",
    order: "DESC",
};

$(document).ready(() => {
    document.body.classList.toggle("dark-mode");
    refreshMarketTableBody();
    refreshCoinList();
    refreshCoinTableBody();
    fadePrev();
});

// Generate the table body for displaying api data
function generateMarketTableBody(data) {
    let number = Intl.NumberFormat("en-US");
    $("#coinSpan").text(data.data.active_cryptocurrencies);
    $("#exchangesSpan").text(data.data.markets);
    $("#totalMarketCapSpan").text("$" + number.format(data.data.total_market_cap.usd.toFixed(0)));
    $("#totalMarketCapSpanPercent").addClass(`${data.market_cap_change_percentage_24h_usd >= 0 ? "text-success" : "text-danger"}`);
    $("#totalMarketCapSpanPercent").text(" " + data.data.market_cap_change_percentage_24h_usd.toFixed(2) + "%");
    $("#_24hVolSpan").text("$" + number.format(data.data.total_volume.usd.toFixed(0)));
    $("#btcSpan").text("BTC " + Number(data.data.market_cap_percentage.btc).toFixed(1) + "%");
    $("#ethSpan").text(" | ETH " + Number(data.data.market_cap_percentage.eth).toFixed(1) + "%");
}

function generateCoinTableBody(data) {
    let number = Intl.NumberFormat("en-US");
    $("#coinTableBody").html(""); //clears body of table
    for (let apiKey in data) {
        $('#coinTableBody').append(
            $('<tr class="content-row"></tr>').append(
                $('<td class="text-left"></td>').text(data[apiKey].market_cap_rank),
                $('<td id="specific" class="text-left "></td>').append(
                    $('<div></div>').append(
                        `<img src="${data[apiKey].image}" width="25"> <a  href="/coinDetails.html?${data[apiKey].id}">
            ${data[apiKey].name}</a>`)),
                $('<td class="text-left "></td>').text(
                    "$" + number.format(data[apiKey].current_price.toFixed(2))
                ),
                $('<td class="text-left"></td>').text(
                    "$" + number.format(data[apiKey].market_cap)
                ),
                $('<td class="text-left"></td>').text(
                    "$" + number.format(data[apiKey].total_volume)
                ),
                $('<td class="text-left"></td>').text(
                    number.format(data[apiKey].circulating_supply.toFixed()) +
                    "  " +
                    data[apiKey].symbol.toUpperCase()
                ),
                $(`<td id="change" class='${data[apiKey].price_change_percentage_24h >= 0
                    ? "text-success"
                    : "text-danger"
                    } 
        text-left'></td>`).text(
                        Number(data[apiKey].price_change_percentage_24h).toFixed(2) + "%"
                    )
            )
        );
    }
}

// Initialize functions
function getMarketData() {
    // retriving api market data as JSON object
    return fetch(marketUrl)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            // print error to console if fail
            console.log(error);
        });
}

function getCoinData() {
    // retriving api coin data as JSON object
    return fetch(coinUrl)
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

/* async functions */
async function refreshMarketTableBody() {
    generateMarketTableBody(await getMarketData());
}
async function refreshCoinTableBody() {
    generateCoinTableBody(await getCoinData());
}

// Pagination

$("#nAnchor").click(async () => {
    currentPage++;
    COIN_DATA_ENDPOINT = `/coins/markets?vs_currency=nzd&order=market_cap_desc&per_page=${coinsPerPage}&page=${currentPage}&sparkline=false`;
    coinUrl = BASE_URL + COIN_DATA_ENDPOINT;
    await refreshCoinTableBody();
    fadePrev();
});

$("#pAnchor").click(async () => {
    currentPage--;
    COIN_DATA_ENDPOINT = `/coins/markets?vs_currency=nzd&order=market_cap_desc&per_page=${coinsPerPage}&page=${currentPage}&sparkline=false`;
    coinUrl = BASE_URL + COIN_DATA_ENDPOINT;
    await refreshCoinTableBody();
    fadePrev();
});

function fadePrev() {
    $("#pageNumber").text("Page: " + currentPage);
    if (currentPage == 1) {
        $("#pAnchor").hide();
    } else {
        $("#pAnchor").show();
    }
}

/* Storing
>   Table headers can be accessed through the class 'sortable' to connect a click event handler 
>   Each column has a unique name by which it can be identified.
>   The data comes presorted by Market Cap in descending order as defined in URL endpoint.*/
$("a.sortable").click(() => {
    sortCoinList(
        $("this").prevObject[0].activeElement.name,
        getSortOrder($("this").prevObject[0].activeElement.name)
    );
});

function getSortOrder(columnName) {
    if (sortOrder.column == columnName) {
        if (sortOrder.order == "DESC") {
            return "ASC";
        }
        return "DESC";
    }
    return "ASC";
}

async function sortCoinList(headerName, order) {
    generateCoinTableBody(sortData(await getCoinData(), headerName, order));
}

function updateSortOrder(headerName, order) {
    sortOrder.column = headerName;
    sortOrder.order = order;
}

function sortData(data, headerName, order) {
    if (order == "ASC") {
        sortAscending(data, headerName);
    } else {
        sortDescending(data, headerName);
    }
    updateSortOrder(headerName, order);
    return data;
}

function sortAscending(data, headerName) {
    data.sort(function (a, b) {
        if (a[headerName] > b[headerName]) {
            return 1;
        } else if (a[headerName] < b[headerName]) {
            return -1;
        } else {
            return 0;
        }
    });
    return data;
}

function sortDescending(data, headerName) {
    data.sort(function (a, b) {
        if (a[headerName] > b[headerName]) {
            return -1;
        } else if (a[headerName] < b[headerName]) {
            return 1;
        } else {
            return 0;
        }
    });
    return data;
}
/* Coin Details  */
function generateListElements(data) {
    let number = Intl.NumberFormat("en-US");
    $('#coinList').html(""); //clears list
    $('#coinList').append(
        $('<li class="list-group-item"></li>').text("Name: " + data.name),
        $('<li  class="list-group-item"></li>').html(
            `<coingecko-coin-price-widget  coin-id="${coinID}" currency="nzd" height="300" locale="en"></coingecko-coin-price-widget> `),
        $('<li class="list-group-item"></li>').html(
            `<script src="https://widgets.coingecko.com/coingecko-coin-market-ticker-list-widget.js"></script>
            <coingecko-coin-market-ticker-list-widget  coin-id="${coinID}" currency="nzd" locale="en" background-color="#212529"></coingecko-coin-market-ticker-list-widget>`
        ),
        $('<li class="list-group-item"></li>').text("Blocktime: " +
            data.block_time_in_minutes + " minutes"),
        $('<li class="list-group-item"></li>').text("Algorithm: " +
            data.hashing_algorithm),
        $('<li class="list-group-item"></li>').html("Description: " +
            data.description.en),
        $('<li class="list-group-item"></li>').html("Homepage: " +
            data.links.homepage[0].link(data.links.homepage[0])),
        $('<li class="list-group-item"></li>').text("Genesis: " + data.genesis_date),
        $('<li class="list-group-item"></li>').text("All Time High: " + "$" +
            number.format(data.market_data.ath.usd)),
        $('<li class="text-success ?  text-danger :list-group-item"></li>').text("From ATH: " +
            Number(data.market_data.ath_change_percentage.usd).toFixed(2) + "%"),



    );



    // <coingecko-coin-heatmap-widget height="400" locale="en"></coingecko-coin-heatmap-widget>

};
async function refreshCoinList() {
    generateListElements(await getApiData());
}

function getApiData() {
    fetch(detailsUrl)
        .then(res => {
            res.json().then(res => {
                generateListElements(res);
            })
        })
        .catch(err => {
            console.log(err);
        });
};
