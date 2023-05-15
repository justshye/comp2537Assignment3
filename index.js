const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

  const startPage = Math.max(1, currentPage - 4);
  const endPage = Math.min(numPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">${i}</button>
    `);
  }

  const prevButton = `
    <button class="btn btn-primary page ml-1 prevButton ${currentPage === 1 ? 'd-none' : ''}">Previous</button>
  `;
  const nextButton = `
    <button class="btn btn-primary page ml-1 nextButton ${currentPage === numPages ? 'd-none' : ''}">Next</button>
  `;

  $('#pagination').prepend(prevButton);
  $('#pagination').append(nextButton);
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const selected_pokemons = pokemons.slice(start, end);

  $('#pokeCards').empty();
  for (const pokemon of selected_pokemons) {
    const res = await axios.get(pokemon.url);
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName="${res.data.name}">
        <h3>${res.data.name.toUpperCase()}</h3>
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">More</button>
      </div>
    `);
  }
};

const setup = async () => {
  $('#pokeCards').empty();
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  paginate(currentPage, PAGE_SIZE, pokemons);
  updatePaginationDiv(currentPage, numPages);

  $('#pokemonCount').text(`Total Pokemon: ${pokemons.length}`);
  $('#displayedPokemonCount').text(`Displayed Pokemon: ${Math.min(PAGE_SIZE, pokemons.length)}`);

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName');
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const types = res.data.types.map((type) => type.type.name);
    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h3>Stats</h3>
          <ul>
            ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
        </div>
        <h3>Types</h3>
        <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
        </ul>
      </div>
    `);
    $('.modal-title').html(`
      <h2>${res.data.name.toUpperCase()}</h2>
      <h5>${res.data.id}</h5>
    `);
  });
  
  // add event listener to pagination buttons
  $('body').on('click', '.numberedButtons', async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, numPages);
  });
  
  // add event listener to previous button
  $('body').on('click', '.prevButton', async function (e) {
    if (currentPage > 1) {
      currentPage--;
      paginate(currentPage, PAGE_SIZE, pokemons);
      updatePaginationDiv(currentPage, numPages);
    }
  });
  
  // add event listener to next button
  $('body').on('click', '.nextButton', async function (e) {
    if (currentPage < numPages) {
      currentPage++;
      paginate(currentPage, PAGE_SIZE, pokemons);
      updatePaginationDiv(currentPage, numPages);
    }
  });
  
  };
  
  $(document).ready(setup);
  
