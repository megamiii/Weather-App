// DOM Elements
const elements = {
    searchInputField: document.querySelector('.app-container__search-input'),
    searchButton: document.querySelector('.app-container__search-btn'),
    weatherDetailsSection: document.querySelector('.weather-section'),
    notFoundMessage: document.querySelector('.app-container__message--not-found'),
    initialSearchMessage: document.querySelector('.app-container__message--search'),
    cityNameText: document.querySelector('.weather-section__city-name'),
    temperatureText: document.querySelector('.weather-section__temperature'),
    weatherConditionText: document.querySelector('.weather-section__condition'),
    humidityText: document.querySelector('.weather-section__humidity-value'),
    windSpeedText: document.querySelector('.weather-section__wind-speed'),
    weatherIconImage: document.querySelector('.weather-section__icon'),
    currentDateText: document.querySelector('.weather-section__current-date'),
    forecastContainer: document.querySelector('.weather-section__forecast'),
    loader: document.createElement('div') // Creating loader dynamically
};

// Add loader class
elements.loader.classList.add('app-container__loader');

// API Key
const apiKey = `YOUR_API_KEY`;

// Event Listeners for Search and 'Enter' Key
elements.searchButton.addEventListener('click', handleSearchEvent);
elements.searchInputField.addEventListener('keydown', handleEnterKeyPress);

/**
 * Handle Search Button Click Event
 */
function handleSearchEvent() {
    const city = elements.searchInputField.value.trim();
    if (city !== '') {
        fetchWeatherAndForecast(city);
        clearInputField();
    }
}

/**
 * Handle 'Enter' Key Event for Search Input
 */
function handleEnterKeyPress(event) {
    if (event.key === 'Enter' && elements.searchInputField.value.trim() !== '') {
        fetchWeatherAndForecast(elements.searchInputField.value);
        clearInputField();
    }
}

/**
 * Clear Input Field After Search
 */
function clearInputField() {
    elements.searchInputField.value = '';
    elements.searchInputField.blur();
}

/**
 * Show Loader
 */
function showLoader() {
    document.body.appendChild(elements.loader);
}

/**
 * Hide Loader
 */
function hideLoader() {
    if (document.body.contains(elements.loader)) {
        document.body.removeChild(elements.loader);
    }
}

/**
 * Get Current Date in Short Format
 * @returns {string} formatted date
 */
function getFormattedCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return currentDate.toLocaleDateString('en-GB', options);
}

/**
 * Fetch Weather and Forecast Data for the Given City
 * @param {string} city
 */
async function fetchWeatherAndForecast(city) {
    showLoader();  // Show loader when data is being fetched
    try {
        const weatherData = await fetchWeather(city);

        if (weatherData.cod !== 200) {
            displayMessage(elements.notFoundMessage);
            hideLoader();  // Hide loader if there is an error
            return;
        }

        updateWeatherUI(weatherData);
        await fetchAndDisplayForecast(city);
        displayMessage(elements.weatherDetailsSection);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    } finally {
        hideLoader();  // Hide loader when data is displayed or on error
    }
}

/**
 * Fetch Weather Data from API
 * @param {string} city
 * @returns {Promise<object>} weather data
 */
async function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

/**
 * Fetch and Display Forecast Data for the Given City
 * @param {string} city
 */
async function fetchAndDisplayForecast(city) {
    try {
        const forecastData = await fetchForecast(city);
        const today = new Date().toISOString().split('T')[0];

        elements.forecastContainer.innerHTML = ''; // Clear previous forecasts

        forecastData.list.forEach(forecastItem => {
            if (forecastItem.dt_txt.includes('12:00:00') && !forecastItem.dt_txt.includes(today)) {
                renderForecastItem(forecastItem);
            }
        });

    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

/**
 * Fetch Forecast Data from API
 * @param {string} city
 * @returns {Promise<object>} forecast data
 */
async function fetchForecast(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

/**
 * Update the Weather Details in the UI
 * @param {object} weatherData
 */
function updateWeatherUI(weatherData) {
    const {
        name: cityName,
        main: { temp, humidity },
        weather: [{ id, main: weatherCondition }],
        wind: { speed: windSpeed }
    } = weatherData;

    elements.cityNameText.textContent = cityName;
    elements.temperatureText.textContent = `${Math.round(temp)} °C`;
    elements.weatherConditionText.textContent = weatherCondition;
    elements.humidityText.textContent = `${humidity}%`;
    elements.windSpeedText.textContent = `${windSpeed} M/s`;
    elements.currentDateText.textContent = getFormattedCurrentDate();
    elements.weatherIconImage.src = `assets/weather/${getWeatherIconFile(id)}`;
}

/**
 * Render Individual Forecast Item
 * @param {object} forecastData
 */
function renderForecastItem(forecastData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = forecastData;

    const formattedDate = new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

    const forecastItemHtml = `
        <article class="weather-section__forecast-item">
            <h5 class="weather-section__forecast-date regular-txt">${formattedDate}</h5>
            <img src="assets/weather/${getWeatherIconFile(id)}" class="weather-section__forecast-icon" alt="Weather Icon">
            <h5 class="weather-section__forecast-temp">${Math.round(temp)} °C</h5>
        </article>
    `;

    elements.forecastContainer.insertAdjacentHTML('beforeend', forecastItemHtml);
}

/**
 * Get Weather Icon Filename Based on Weather ID
 * @param {number} id - Weather condition ID
 * @returns {string} icon filename
 */
function getWeatherIconFile(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

/**
 * Display the Appropriate Section Based on User Interaction
 * @param {HTMLElement} section
 */
function displayMessage(section) {
    [elements.weatherDetailsSection, elements.initialSearchMessage, elements.notFoundMessage].forEach(el => el.style.display = 'none');
    section.style.display = 'flex';
}