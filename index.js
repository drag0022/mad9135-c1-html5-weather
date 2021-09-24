import { getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation } from './map.service.js';

function main() {
	try {
		const searchButton = document.getElementById('searchButton');
		searchButton.addEventListener('click', search);
	} catch (error) {
		console.log(error.message);
	}
}

async function search(ev) {
	ev.preventDefault();
	try {
		const searchValue = document.getElementById('searchField').value;
		//If user doesn't type a location to search, display a message.
		if (searchValue == '') {
			document.getElementById('forecastContainer').innerHTML =
				'Please Type In A Location';
		} else {
			const coord = await getGeolocation(searchValue);
			console.log(coord);
			const forecast = await getForecast({ coord });
			console.log(forecast);
		}
	} catch (error) {
		console.log(error.message);
	}
}

document.addEventListener('DOMContentLoaded', main);
