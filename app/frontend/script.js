let currentPage = 1;
let currentQuery = "";

async function searchVideos(page = 1) {

    currentPage = page;

    const queryInput = document.getElementById("query");

    // ✅ Save query only on first search
    if (page === 1) {
        currentQuery = queryInput.value.trim();
    }

    const status = document.getElementById("status");

    const container = document.getElementById("videos-container");

    container.innerHTML = "";

    status.innerHTML = "Loading videos...";

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/videos?q=${currentQuery}&page=${currentPage}&limit=28`
        );

        const data = await response.json();

        status.innerHTML = "";

        // ✅ Processing state
        if (data.status === "processing") {
            status.innerHTML = data.message;
            return;
        }

        // ✅ Error state
        if (data.error) {
            status.innerHTML = data.error;
            return;
        }

        // ✅ No videos
        if (!data.videos || data.videos.length === 0) {

            container.innerHTML = "";

            status.innerHTML = `
                <h2>No videos found</h2>
            `;

            return;
        }

        // ✅ Render videos
        data.videos.forEach(video => {

            container.innerHTML += `

                <div class="video-card">

                    <a 
                        href="https://www.youtube.com/watch?v=${video.video_id}" 
                        target="_blank"
                    >
                        <img src="${video.thumbnail}" />
                    </a>

                    <div class="video-content">

                        <h3>${video.title}</h3>

                        <p>${video.description}</p>

                        <small>
                            Published:
                            ${video.published_at}
                        </small>

                    </div>

                </div>

            `;
        });

        // ✅ Pagination buttons
        container.innerHTML += `

            <div class="pagination">

                <button 
                    onclick="previousPage()"
                    ${currentPage === 1 ? "disabled" : ""}
                >
                    Previous
                </button>

                <span>
                    Page ${currentPage}
                </span>

                <button onclick="nextPage()">
                    Next
                </button>

            </div>

        `;

    } catch (error) {

        status.innerHTML = "Something went wrong";

        console.log(error);
    }
}


// ✅ Next page
function nextPage() {

    currentPage++;

    searchVideos(currentPage);
}


// ✅ Previous page
function previousPage() {

    if (currentPage > 1) {

        currentPage--;

        searchVideos(currentPage);
    }
}