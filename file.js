
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const recipeContainer = document.getElementById("recipeContainer");
    const recipeModal = document.getElementById("recipeModal");
    const modalContent = document.getElementById("modalContent");
    const closeBtn = document.getElementById("closeBtn");
    const searchStatus = document.getElementById("searchStatus");
    const resultsTitle = document.getElementById("resultsTitle");

    const API_URL =
        "https://www.themealdb.com/api/json/v1/1/search.php";

    function status(message) {
        if (searchStatus) {
            searchStatus.textContent = message;
        } else {
            console.log(message);
        }
    }

    async function fetchRecipes(query) {
        const response = await fetch(
            `${API_URL}?s=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.meals || [];
    }

    function displayRecipes(recipes) {
        recipeContainer.replaceChildren();

        if (!recipes.length) {
            status("No recipes found. Try searching for chicken or pasta.");
            return;
        }

        status(`${recipes.length} recipes found.`);

        recipes.forEach(recipe => {
            const card = document.createElement("article");
            card.className = "recipe-card";

            const img = document.createElement("img");
            img.src = recipe.strMealThumb;
            img.alt = recipe.strMeal;
            img.loading = "lazy";

            const title = document.createElement("h3");
            title.textContent = recipe.strMeal;

            const button = document.createElement("button");
            button.className = "show-recipe-btn";
            button.type = "button";
            button.textContent = "View Recipe";

            button.addEventListener("click", () => {
                showRecipe(recipe);
            });

            card.append(img, title, button);
            recipeContainer.appendChild(card);
        });
    }

    function showRecipe(recipe) {
        modalContent.replaceChildren();

        const title = document.createElement("h2");
        title.textContent = recipe.strMeal;

        const category = document.createElement("p");
        category.textContent = `Category: ${recipe.strCategory || "N/A"}`;

        const image = document.createElement("img");
        image.src = recipe.strMealThumb;
        image.alt = recipe.strMeal;
        image.className = "modal-recipe-image";

        const heading = document.createElement("h3");
        heading.textContent = "Ingredients";

        const list = document.createElement("ul");

        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];

            if (ingredient && ingredient.trim()) {
                const item = document.createElement("li");
                item.textContent = `${ingredient.trim()} ${
                    measure ? measure.trim() : ""
                }`;
                list.appendChild(item);
            }
        }

        const instructionsHeading = document.createElement("h3");
        instructionsHeading.textContent = "Instructions";

        const instructions = document.createElement("p");
        instructions.className = "instructions";
        instructions.textContent =
            recipe.strInstructions || "No instructions available.";

        modalContent.append(
            title,
            category,
            image,
            heading,
            list,
            instructionsHeading,
            instructions
        );

        recipeModal.classList.add("is-open");
        recipeModal.style.display = "flex";
        recipeModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        recipeModal.classList.remove("is-open");
        recipeModal.style.display = "none";
        recipeModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    }

    async function searchRecipes(query) {
        query = query.trim();

        if (!query) {
            status("Please enter a recipe name.");
            return;
        }

        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.textContent = "Searching...";
        }

        if (resultsTitle) {
            resultsTitle.textContent = `Results for "${query}"`;
        }

        status("Loading recipes...");
        recipeContainer.replaceChildren();

        try {
            const recipes = await fetchRecipes(query);
            displayRecipes(recipes);
        } catch (error) {
            console.error("Recipe loading error:", error);
            status("Could not load recipes. Check your internet connection.");
        } finally {
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.textContent = "Search";
            }
        }
    }

    // Supports both redesigned and original HTML.
    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            searchRecipes(searchInput.value);
        });
    } else if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            searchRecipes(searchInput.value);
        });

        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchRecipes(searchInput.value);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    recipeModal.addEventListener("click", event => {
        if (event.target === recipeModal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    // Load suggested recipes when the website opens
loadSuggestedRecipes();

async function loadSuggestedRecipes() {
    status("Loading suggested recipes...");

    try {
        // Fetch different types of recipes
        const searches = ["chicken", "pasta", "cake"];

        const results = await Promise.all(
            searches.map(async (food) => {
                const response = await fetch(
                    `${API_URL}?s=${encodeURIComponent(food)}`
                );

                if (!response.ok) {
                    throw new Error("Unable to load recipes");
                }

                const data = await response.json();
                return data.meals || [];
            })
        );

        // Combine results and remove duplicate recipes
        const uniqueRecipes = [
            ...new Map(
                results.flat().map(recipe => [recipe.idMeal, recipe])
            ).values()
        ];

        // Shuffle the suggestions for variety
        uniqueRecipes.sort(() => Math.random() - 0.5);

        // Show up to 12 recipe cards
        displayRecipes(uniqueRecipes.slice(0, 12));

        if (resultsTitle) {
            resultsTitle.textContent = "Recommended Recipes";
        }
    } catch (error) {
        console.error("Suggestion loading error:", error);
        status("Unable to load suggestions. Please check your internet connection.");
    }
}

});
