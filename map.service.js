const API_TOKEN = 'pk.4bac5609925c8c40b9db11f2d412d2e0';
const BASE_URL = 'https://us1.locationiq.com/v1';

export async function getGeolocation(location) {
	const url = `${BASE_URL}/search.php?key=${API_TOKEN}&q=${location}&format=json`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	const data = await response.json();
	console.log({ url });
	return { lat: data[0].lat, lon: data[0].lon };
}
