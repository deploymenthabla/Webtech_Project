const apiUrl = "https://jsonplaceholder.typicode.com/posts?_limit=5"; // Limit to 5 posts

// DOM Elements
const postList = document.getElementById("posts");
const postForm = document.getElementById("postForm");
const postIdField = document.getElementById("postId");
const titleField = document.getElementById("title");
const bodyField = document.getElementById("body");
const editingArea = document.getElementById("editingArea");
const editPostIdField = document.getElementById("editPostId");
const editTitleField = document.getElementById("editTitle");
const editBodyField = document.getElementById("editBody");

const fetchPosts = async () => {
    postList.innerHTML = "Loading posts...";
    try {
        const response = await fetch(apiUrl);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        postList.innerHTML = "Error loading posts.";
        console.error("Error fetching posts:", error);
    }
};

const renderPosts = (posts) => {
    postList.innerHTML = posts
        .map(
            (post) => `
        <div class="post" id="post-${post.id}">
            <h3>${post.title}</h3>
            <p>${post.body}</p>
            <button class="edit" data-id="${post.id}">Edit</button>
            <button class="delete" onclick="deletePost(${post.id}, this)">Delete</button>
        </div>
    `
        )
        .join("");
    // Attach event listeners for the Edit buttons after the DOM has been updated
    attachEditListeners();
};

// Add or Update Post
postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = postIdField.value;
    const title = titleField.value;
    const body = bodyField.value;

    const post = { title, body };

    if (postId) {
        // Updating an existing post
        await fetch(`${apiUrl}/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
        });
        // After updating, immediately update the post on the list
        updatePostInList(postId, post);
    } else {
        // Adding a new post
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(post),
        });
        const newPost = await response.json();
        // Add the new post to the top of the list
        addPostToTop(newPost);
    }

    // Clear form fields after submission
    postIdField.value = "";
    titleField.value = "";
    bodyField.value = "";
});

// Add New Post to Top
const addPostToTop = (post) => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.id = `post-${post.id}`;
    postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
        <button class="edit" data-id="${post.id}">Edit</button>
        <button class="delete" onclick="deletePost(${post.id}, this)">Delete</button>
    `;
    // Prepend the new post to the top of the list
    postList.prepend(postElement);
    // Re-attach event listener for the Edit button
    attachEditListeners();
};

// Attach event listeners to all Edit buttons dynamically
const attachEditListeners = () => {
    const editButtons = document.querySelectorAll(".edit");
    editButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const postId = e.target.getAttribute("data-id");
            console.log("Edit button clicked for post ID:", postId); // Debugging line
            if (postId) {
                editPost(postId); // Call editPost with the correct ID
            }
        });
    });
};

// Edit Post
const editPost = (postId) => {
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
        const title = postElement.querySelector("h3").innerText;
        const body = postElement.querySelector("p").innerText;

        // Populate the editing area with the current post data
        editPostIdField.value = postId;
        editTitleField.value = title;
        editBodyField.value = body;

        // Show the editing area
        editingArea.style.display = "block";
    }
};
// Edit Post Form Submit (Updating)
document.getElementById("editForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = editPostIdField.value;
    const title = editTitleField.value;
    const body = editBodyField.value;

    const post = { title, body };

    // Updating the post
    await fetch(`${apiUrl}/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
    });

    // Update the post in the list after editing
    updatePostInList(postId, post);

    // Hide the edit area after submission
    editingArea.style.display = "none";

    // Clear form fields after submission
    editPostIdField.value = "";
    editTitleField.value = "";
    editBodyField.value = "";
});

// Update Post in the List After Editing
const updatePostInList = (id, post) => {
    const postElement = document.getElementById(`post-${id}`);
    if (postElement) {
        postElement.querySelector("h3").innerText = post.title;
        postElement.querySelector("p").innerText = post.body;
    }
};

// Delete Post
const deletePost = async (id, button) => {
    // Send DELETE request to remove the post
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });

    // Remove the post from the DOM immediately
    const postElement = button.closest(".post");
    postElement.remove();
};

// Initialize
fetchPosts();
