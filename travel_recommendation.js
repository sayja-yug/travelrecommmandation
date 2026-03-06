const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsArea = document.getElementById("resultsArea");

let travelData = null;

const countryTimezones = {
	Australia: "Australia/Sydney",
	Japan: "Asia/Tokyo",
	Brazil: "America/Sao_Paulo",
};

const normalizeKeyword = (value) => value.trim().toLowerCase();

const renderEmptyMessage = (message) => {
	resultsArea.innerHTML = `<p class="empty-message">${message}</p>`;
};

const getCountryTime = (countryName) => {
	const timeZone = countryTimezones[countryName];

	if (!timeZone) {
		return "";
	}

	const options = {
		timeZone,
		hour12: true,
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	};

	return new Date().toLocaleTimeString("en-US", options);
};

const createResultCard = (item) => {
	const timeRow = item.country
		? `<div class="time-row">Current time in ${item.country}: ${getCountryTime(item.country)}</div>`
		: "";

	return `
		<article class="result-card">
			<img src="${item.imageUrl}" alt="${item.name}" />
			<div class="result-card-body">
				<h3>${item.name}</h3>
				<p>${item.description}</p>
				${timeRow}
			</div>
		</article>
	`;
};

const renderResults = (results, title) => {
	if (!results.length) {
		renderEmptyMessage("No recommendations found. Try beach, temple, or country.");
		return;
	}

	const cards = results.map(createResultCard).join("");
	resultsArea.innerHTML = `
		<h2 class="results-title">${title}</h2>
		<div class="results-grid">${cards}</div>
	`;
};

const getSearchResults = (keyword) => {
	if (!travelData) {
		return [];
	}

	const isBeach = keyword === "beach" || keyword === "beaches";
	const isTemple = keyword === "temple" || keyword === "temples";
	const isCountry = keyword === "country" || keyword === "countries";

	if (isBeach) {
		return travelData.beaches.slice(0, 2);
	}

	if (isTemple) {
		return travelData.temples.slice(0, 2);
	}

	if (isCountry) {
		return travelData.countries.flatMap((country) =>
			country.cities.slice(0, 2).map((city) => ({
				...city,
				country: country.name,
			}))
		);
	}

	const matchedCountry = travelData.countries.find(
		(country) => normalizeKeyword(country.name) === keyword
	);

	if (matchedCountry) {
		return matchedCountry.cities.map((city) => ({
			...city,
			country: matchedCountry.name,
		}));
	}

	return [];
};

const handleSearch = () => {
	const keyword = normalizeKeyword(searchInput.value);

	if (!keyword) {
		renderEmptyMessage("Enter a keyword like beach, temple, or country.");
		return;
	}

	const resultList = getSearchResults(keyword);
	renderResults(resultList, "Search Results");
};

const clearResults = () => {
	searchInput.value = "";
	resultsArea.innerHTML = "";
};

const fetchTravelData = async () => {
	try {
		const response = await fetch("travel_recommendation_api.json");

		if (!response.ok) {
			throw new Error("Unable to load travel data.");
		}

		travelData = await response.json();
		console.log("Travel recommendation data:", travelData);
	} catch (error) {
		console.error(error);
		renderEmptyMessage("Travel data could not be loaded. Please try again.");
	}
};

if (searchBtn && clearBtn && searchInput && resultsArea) {
	searchBtn.addEventListener("click", handleSearch);
	clearBtn.addEventListener("click", clearResults);
	fetchTravelData();
}
