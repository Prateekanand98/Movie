const apiKey = '7e180f43';
const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const detailsDiv = document.getElementById('movie-details');
const detailsContent = document.getElementById('details-content');
const backToResultsButton = document.getElementById('back-to-results');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageNumberSpan = document.getElementById('page-number');

let currentPage = 1;
let totalResults = 0;
let debounceTimeout = null;

searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        currentPage = 1;
        searchMovies(searchInput.value);
    }, 500);
});

function searchMovies(query, page = 1) {
    if (query.trim() === '') return;

    resultsDiv.innerHTML = '';
    loadingDiv.classList.remove('hidden');

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${query}&page=${page}`)
        .then(response => response.json())
        .then(data => {
            loadingDiv.classList.add('hidden');
            if (data.Response === "True") {
                totalResults = parseInt(data.totalResults);
                displayMovies(data.Search);
                updatePagination();
            } else {
                resultsDiv.innerHTML = '<p>No results found.</p>';
            }
        })
        .catch(error => {
            loadingDiv.classList.add('hidden');
            resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

function displayMovies(movies) {
    resultsDiv.innerHTML = movies.map(movie => `
        <div class="movie-card" data-imdbid="${movie.imdbID}">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        </div>
    `).join('');
    resultsDiv.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => showMovieDetails(card.dataset.imdbid));
    });
}

function showMovieDetails(imdbID) {
    resultsDiv.classList.add('hidden');
    detailsDiv.classList.remove('hidden');
    loadingDiv.classList.remove('hidden');

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
        .then(response => response.json())
        .then(movie => {
            loadingDiv.classList.add('hidden');
            detailsContent.innerHTML = `
                <h2>${movie.Title} (${movie.Year})</h2>
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}">
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Released:</strong> ${movie.Released}</p>
                <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
            `;
        })
        .catch(error => {
            loadingDiv.classList.add('hidden');
            detailsContent.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

backToResultsButton.addEventListener('click', () => {
    detailsDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        searchMovies(searchInput.value, currentPage);
    }
});

nextPageButton.addEventListener('click', () => {
    if (currentPage * 10 < totalResults) {
        currentPage++;
        searchMovies(searchInput.value, currentPage);
    }
});

function updatePagination() {
    pageNumberSpan.textContent = currentPage;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage * 10 >= totalResults;
}
