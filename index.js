import { getForecast } from './weather.service.js';
import { getGeolocation } from './map.service.js';

function main() {
	try {
		//search button listener
		const searchButton = document.getElementById('searchButton');
		searchButton.addEventListener('click', search);

		//switch tabs
		const tabs = document.querySelectorAll('.tabs > ul > li');
		let lastActiveTabIndex = 0; // current tab by default
		tabs.forEach((tab, index) => {
			tab.addEventListener('click', (ev) => {
				tab.classList.add('is-active');
				tabs[lastActiveTabIndex].classList.remove('is-active');
				lastActiveTabIndex = index;
				search(ev);
			});
		});

		//Get user location button listener
		const userLocation = document.getElementById('userLocation');
		userLocation.addEventListener('click', getUserLocation);

		//auto refresh user location every time it changes
		setInterval(() => {
			if (haveUserLocation) {
				if (
					currentLatitude != prevLatitude ||
					currentLongitude != prevLongitude
				) {
					console.log('location updated');
					getUserLocation(ev);
				}
			}
		}, 3600000); //1hour interval
	} catch (error) {
		console.log(error.message);
	}
}

let haveUserLocation = false;
let prevLatitude = 0;
let prevLongitude = 0;
let currentLatitude = 0;
let currentLongitude = 0;

function getUserLocation(ev) {
	ev.preventDefault();
	prevLatitude = currentLatitude;
	prevLongitude = currentLongitude;
	const options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0,
	};
	async function success(pos) {
		currentLatitude = pos.coords.latitude;
		currentLongitude = pos.coords.longitude;
		const forecast = await getForecast({ currentLatitude, currentLongitude });
		haveUserLocation = true;
		selectUI(forecast);
	}

	function error(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	}

	navigator.geolocation.getCurrentPosition(success, error, options);
}

async function search(ev) {
	ev.preventDefault();
	try {
		const searchValue = document.getElementById('searchField').value;
		//If user doesn't type a location to search, display a message.
		if (searchValue == '') {
			if (haveUserLocation == true) {
				//save location to check if it updates every hour
				getUserLocation(ev);
			} else {
				document.getElementById('forecastContainer').innerHTML =
					'Please Type In A Location';
			}
		} else {
			const coord = await getGeolocation(searchValue);
			console.log(coord);
			const forecast = await getForecast({ coord });
			console.log({ coord });
			console.log(forecast);
			//build a switch case to determine what HTML we are building (current, 6hours or 6days). Check classList of nav labels to see which one is active.
			selectUI(forecast);
		}
	} catch (error) {
		console.log(error.message);
	}
}

function selectUI(forecast) {
	try {
		//determine which tab the user is currently on
		let selectedLabel = '';
		const selectedLabels = document.querySelectorAll('.tabs > ul > li');
		selectedLabels.forEach((label, index) => {
			//record array index for switch statement
			if (label.classList.contains('is-active')) selectedLabel = index;
		});
		console.log(selectedLabel);

		// build user interface based on which tab the user is currently on

		switch (selectedLabel) {
			//user is in 'Current' tab
			case 0:
				// clear prev content
				document.getElementById('forecastContainer').innerHTML = '';
				//build UI
				buildUI(forecast);

				break;
			//user is in '6 Hour' tab
			case 1:
				//grab hourly forecasts array
				const forecastSixH = forecast.hourly;
				forecastSixH.splice(6);
				document.getElementById('forecastContainer').innerHTML = '';
				//build UI
				buildUI(forecastSixH);
				break;
			//user is in '6 Days' tab
			case 2:
				const forecastSixD = forecast.daily;
				forecastSixD.splice(6);
				// clear prev content
				document.getElementById('forecastContainer').innerHTML = '';
				//build UI
				buildUI(forecastSixD);
				break;
			default:
				throw new Error('Switch case is on default');
		}
	} catch (error) {
		console.log(error.message);
	}
}

function buildUI(forecasts) {
	//clear previous call
	document.getElementById('forecastContainer').innerHTML = '';
	//only need first 6 elements from array
	let counter = 0;
	//build HTML
	//when we are on Current tab, the forecasts variable is not an array
	if (Array.isArray(forecasts)) {
		forecasts.forEach((forecast) => {
			const forecastContainer = document.getElementById('forecastContainer');
			//create container outside document fragment
			const cardContainer = document.createElement('div');
			cardContainer.classList.add('card', 'column', 'is-one-third');

			const df = new DocumentFragment();
			let icon = forecast.weather[0].icon;
			const mainDesc = forecast.weather[0].main;
			const feelsLike = forecast.feels_like.day || forecast.feels_like;
			const temp = forecast.temp.day || forecast.temp;
			cardContainer.innerHTML = `
					<div class="card-image">
							<figure class="image is-4by3">
								<img src="https://openweathermap.org/img/w/${icon}.png" alt="weather icon">
							</figure>
						</div>
						<div class="card-content">
							<div class="media">
								<div class="media-content">
									<p class="subtitle is-6">Current Status: ${mainDesc}</p>
									<p>${temp} C</p>
									<p>Feels Like: ${feelsLike}</p>
									<p>Humidity: ${forecast.humidity} </p>
									</div>
							</div>
					
							<div class="content">
								Weather: 
							${forecast.weather[0].description}</a>.
							</div>
						</div>
				`;

			df.append(cardContainer);
			forecastContainer.append(cardContainer);
		});
	} else {
		const forecastContainer = document.getElementById('forecastContainer');
		//create container outside document fragment
		const cardContainer = document.createElement('div');
		cardContainer.classList.add('card', 'column', 'is-one-third');
		const df = new DocumentFragment();
		const feelsLike =
			forecasts.current.feels_like.day || forecasts.current.feels_like;
		const temp = forecasts.current.temp.day || forecasts.current.temp;
		cardContainer.innerHTML = `
			<div class="card-image">
						<figure class="image is-4by3">
							<img src="https://openweathermap.org/img/w/${forecasts.current.weather[0].icon}.png" alt="weather icon">
						</figure>
					</div>
					<div class="card-content">
						<div class="media">
							<div class="media-content">
								<p class="subtitle is-6">Current Status: ${forecasts.current.weather[0].main}</p>
								<p>${temp} C</p>
								<p>Feels Like: ${feelsLike}</p>
								<p>Humidity: ${forecasts.current.humidity} </p>
								</div>
						</div>
						<div class="content">
						Weather: 
							${forecasts.current.weather[0].description}</a>.		
						</div>
			</div>
		`;

		df.append(cardContainer);
		forecastContainer.append(cardContainer);
	}
}

document.addEventListener('DOMContentLoaded', main);
