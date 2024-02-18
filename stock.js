document.addEventListener('DOMContentLoaded',loadData);


const stockList=document.querySelector('#stock-list');
const stockDetails=document.querySelector('#detail-section');


const stockStatsUrl="https://stocks3.onrender.com/api/stocks/getstockstatsdata";
const stockSumUrl="https://stocks3.onrender.com/api/stocks/getstocksprofiledata";
const stockDataUrl="https://stocks3.onrender.com/api/stocks/getstocksdata";

let currentStock ;
let currentRange = '1mo';

function loadObjectFromAPI(apiUrl,callback) {
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        callback(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
}
function processStockData(data) {
    const stockStats = data.stocksStatsData[0];
    const stocks = Object.keys(stockStats);
    stocks.pop();
    currentStock = stocks[0];

    for (let i of stocks) {
        const listEl = document.createElement('li');
        const buttonEl = document.createElement('button');
        const bookEl = document.createElement('span');
        const profitEl = document.createElement('span');

        buttonEl.textContent = i;
        buttonEl.classList.add('btn', 'btn-secondary', 'm-1');
        bookEl.textContent = (stockStats[i].bookValue).toFixed(3);
        bookEl.classList.add('m-3', 'p-1', 'text-white');
        const profit = (stockStats[i].profit).toFixed(2);
        profitEl.textContent = `${profit} % `;
        if (profit > 0) {
            profitEl.classList.add('text-success' );
        } else {
            profitEl.classList.add('text-danger');
        }

        listEl.append(buttonEl);
        listEl.append(bookEl);
        listEl.append(profitEl);
        stockList.append(listEl);
    }

    loadDetails(currentStock, stockStats[currentStock]);
    loadChart(currentStock, '1mo');

    // Add event listener for button clicks using event delegation
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn')) {
            // Find the parent <li> element of the clicked button
            const listItem = event.target.closest('li');
            if (listItem) {
                const stockName = listItem.querySelector('button').textContent;
                currentStock = stockName;
                console.log(currentStock);
                loadDetails(stockName, stockStats[stockName]);
                loadChart(stockName,'1mo');
            }
        }
    });
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function loadChart(stockName , stockRange){
    loadObjectFromAPI(stockDataUrl, function(data) {
        const graphData = data.stocksData[0];
        const filteredData = graphData[stockName];
        const dateData =filteredData[stockRange];
        console.log(dateData);

        const formatedDates = [...dateData.timeStamp];
        const ydata = [...dateData.value];
        const xdata = [];

        // Loop through each timestamp and convert it to a formatted date
        formatedDates.forEach(timestamp => {
            const new_timestamp = new Date(timestamp * 1000).toLocaleDateString();
            xdata.push(new_timestamp);
        });

        // Get the canvas element
        const ctx = document.getElementById('stock-chart').getContext('2d');

        // Check if there is an existing Chart instance
        if (window.myChart) {
            window.myChart.destroy(); // Destroy the existing Chart instance
        }

        // Create the new chart
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xdata,
                datasets: [{
                    label: currentStock,
                    data: ydata,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        display: false 
                    },
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        display: false // hide the legend
                    }
                }
            }
        });
    });
} 

function loadDetails(stockName,stockStats){
    loadObjectFromAPI(stockSumUrl, function(data) {
    removeAllChildNodes(stockDetails);
    const stockHead = document.createElement('span');

    const detailsHead = document.createElement('span');    
    const bookEl = document.createElement('span');
    const profitEl = document.createElement('span');
    const summaryEl = document.createElement('span');
    const paraEl = document.createElement('p');

    detailsHead.textContent = stockName; 
    detailsHead.classList.add('h5' ,'shift-right')
    bookEl.textContent = (stockStats.bookValue).toFixed(3);
    bookEl.classList.add('m-4', 'p-1' , 'h5' );
    const profit = (stockStats.profit).toFixed(2);
    profitEl.textContent = `${profit} % `;
    if (profit > 0) {
        profitEl.classList.add('text-success' , 'h5' );
    } else {
        profitEl.classList.add('text-danger' , 'h5');
    }
    
    
    const summ=data.stocksProfileData[0];
    paraEl.textContent=summ[stockName].summary;
    summaryEl.append(paraEl);
    paraEl.classList.add('stock-summary');

    stockHead.append(detailsHead);
    stockHead.append(bookEl);
    stockHead.append(profitEl);
    stockDetails.append(stockHead);
    stockDetails.append(summaryEl);
});
}


function loadData(){
    loadObjectFromAPI(stockStatsUrl, processStockData);
}


function handleButtonClick(buttonId, range) {
    document.getElementById(buttonId).addEventListener('click', function () {
        currentRange = range;
        loadChart(currentStock, currentRange);
    });
}

// Attach event listeners to buttons for changing data range
handleButtonClick('one-m', '1mo');
handleButtonClick('three-m', '3mo');
handleButtonClick('one-y', '1y');
handleButtonClick('five-y', '5y');
