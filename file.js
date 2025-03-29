document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const recipeContainer = document.getElementById('recipeContainer');
    const recipeModal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementById('closeBtn');

    const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php'; 

    // Function to fetch recipes from the API
    async function fetchRecipes(query) {
        try {
            const response = await fetch(`${API_URL}?s=${query}`);
            const data = await response.json();
            return data.meals;
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    }

    // Function to display recipes
    function displayRecipes(recipes) {
        recipeContainer.innerHTML = '';
        if (recipes === null) {
            recipeContainer.innerHTML = '<p>No recipes found</p>';
            return;
        }
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');

            const recipeImage = document.createElement('img');
            recipeImage.src = recipe.strMealThumb;
            recipeImage.alt = recipe.strMeal;

            const recipeTitle = document.createElement('h3');
            recipeTitle.textContent = recipe.strMeal;

            const showRecipeBtn = document.createElement('button');
            showRecipeBtn.classList.add('show-recipe-btn');
            showRecipeBtn.textContent = 'View Recipe';
            showRecipeBtn.addEventListener('click', () => displayModal(recipe));

            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeTitle);
            recipeCard.appendChild(showRecipeBtn);

            recipeContainer.appendChild(recipeCard);
        });
    }

    // Function to display recipe details modal
    function displayModal(recipe) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${ingredient} - ${measure}`);
            }
        }

        modalContent.innerHTML = `
            <h2>${recipe.strMeal}</h2>
            <p>Category: ${recipe.strCategory}</p>
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <p>Instructions: ${recipe.strInstructions}</p>
        `;
        recipeModal.style.display = 'block';
    }

    // Close modal when close button is clicked
    closeBtn.addEventListener('click', () => {
        recipeModal.style.display = 'none';
    });

    // Event listener for search button
    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value;
        if (query.trim() !== '') {
            const recipes = await fetchRecipes(query);
            displayRecipes(recipes);
        }
    });
});
