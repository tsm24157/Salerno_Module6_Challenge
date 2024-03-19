
var cityMenu = document.getElementById("cityMenu");
var searchBox = document.getElementById("searchBox");
var searchButton = document.getElementById("searchButton");
var currentInfo = document.getElementById("currentInfo");
var weatherCardsContainer = document.getElementById("fiveDayWeather");


var keyAPI = "bfcf3c1f54781a5d45ad618d1c8a4da9";
var city = "";

var hist = false;

function getCurrentWeather() {
    if (searchBox.value !== "" || hist) {
        if (!hist) {
            city = searchBox.value;
        }
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${keyAPI}&units=imperial`)
            .then(response => {
                if (response.ok) {
                    fiveDayForecast();
                    return response.json();
                }
                throw new Error('Something did not work.');
            })
            .then(function (data) {
                var newTitle = document.createElement('h2');
                var newTemp = document.createElement('h4');
                var newWind = document.createElement('h4');
                var newHumid = document.createElement('h4');

                currentInfo.style = "border: 2px solid grey;";
                newTitle.textContent = `${data.name}`;
                newTemp.textContent = `Temp: ${data.main.temp}°F`;
                newWind.textContent = `Wind: ${data.wind.speed} Mph`;
                newHumid.textContent = `Humidity: ${data.main.humidity}%`;

                newTitle.innerHTML +=
                    `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="weather-icon">`;

                currentInfo.textContent = "";
                currentInfo.appendChild(newTitle);
                currentInfo.appendChild(newTemp);
                currentInfo.appendChild(newWind);
                currentInfo.appendChild(newHumid);

            })
            .catch((error) => {
                console.log(error)
            });
    }
    hist = false;
}

function fiveDayForecast() {
    weatherCardsContainer.textContent = "";
    var fiveTitle = document.createElement('h5');
    fiveTitle.textContent = "Five Day Forecast:";
    weatherCardsContainer.appendChild(fiveTitle);

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${keyAPI}&units=imperial`)
        .then((response) => {
            if (response.ok) {
                addHistoryButton(city);
                return response.json();
            }
            currentInfo.textContent = "";
            weatherCardsContainer.textContent = "";
            throw new Error('Could not find location.');
        })
        .then(function (data) {
            const desiredTime = /09:00:00$/;
            var dataIndex = 0;
            dataList = data.list;
            tempTime = data.list[dataIndex].dt_txt.slice(-8);

            for (i = 0; i < 5; i++) {
                while (dataIndex < data.list.length && !(desiredTime.test(tempTime))) {
                    dataIndex++;
                    tempTime = data.list[dataIndex].dt_txt.slice(-8);
                }
                tempDataItem = dataList[dataIndex];
                weatherCardsContainer.appendChild(createWeatherCard
                    (formatDate(tempDataItem.dt_txt.substring(0, 10)), tempDataItem.weather[0].icon, tempDataItem.main.temp,
                        tempDataItem.wind.speed, tempDataItem.main.humidity));
                dataIndex++;
                tempTime = data.list[dataIndex].dt_txt.slice(-8);
            }
        })
        .catch((error) => {
            userErrorMessage = document.createElement('h2');
            userErrorMessage.textContent = error;
            weatherCardsContainer.appendChild(userErrorMessage);
        });
}

function createWeatherCard(date, icon, temp, wind, humid) {
    var tempCard = document.createElement('div');
    tempCard.className = "card";
    tempCard.style = "display: inline-block;";
    tempCard.innerHTML =
        `<div class="card-header">
        ${date} <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather-icon">
    </div>
    <ul id = "cardItems" class="list-group list-group-flush">
    <li class="list-group-item">Temp: ${temp}°F</li>
    <li class="list-group-item">Wind: ${wind} Mph</li>
    <li class="list-group-item">Humidity: ${humid}%</li>
    </ul>`;
    return tempCard;
}

function formatDate(date) {
    newDate = "";
    day = "";
    month = "";
    year = "";
    year = date.substring(0, 4);
    month = date.substring(5, 7);
    day = date.substring(8, 10);
    return `${month}/${day}/${year}`;
}

function addHistoryButton(cityName) {
    prevSearchHist = false;
    hButtonCount = 0;

    for (i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key !== null && key.includes("weatherSearch")) {
            if (key.substring(13).toLowerCase() === cityName.toLowerCase()) {
                prevSearchHist = true;
            }
            hButtonCount++;
        }
    }

    if (!prevSearchHist && hButtonCount < 10) {
        correctCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
        localStorage.setItem(`weatherSearch${correctCityName}`, " ");
        var greyButton = document.createElement('a');
        greyButton.className = "btn btn-secondary";
        greyButton.innerHTML = correctCityName;
        cityMenu.appendChild(greyButton);
    }
}

function searchHistory() {
    for (i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key !== null && key.includes("weatherSearch")) {
            var greyButton = document.createElement('a');
            greyButton.className = "btn btn-secondary";
            greyButton.onclick = histSearch;
            greyButton.innerHTML = key.substring(13);
            cityMenu.appendChild(greyButton);
        }
    }
}

function histSearch() {
    hist = true;
    city = this.innerHTML;
    getCurrentWeather();
}

searchButton.addEventListener("click", getCurrentWeather);
