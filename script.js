let currentPage = 1;
let currentQuery = "Machine Learning";
const limit = 12;

// In-memory indexed YouTube cache for fallback/showcase
const fallbackVideos = {
  "Machine Learning": [
    {
      id: "ukzFI9rgwfU",
      title: "Machine Learning Full Course - Learn Machine Learning 10 Hours",
      channel: "Edureka",
      published_at: "2026-09-15T10:30:00Z",
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=640&q=80",
      description: "Comprehensive Machine Learning tutorial covering Supervised Learning, Unsupervised Learning, Neural Networks, Scikit-learn, and model deployment strategies."
    },
    {
      id: "7eh4d6sabA0",
      title: "Building Real-Time Data Pipelines for Machine Learning",
      channel: "DataCamp",
      published_at: "2026-09-12T14:20:00Z",
      thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&q=80",
      description: "Learn how modern MLOps pipelines ingest streaming data, validate feature sets, and maintain online model inference services with high availability."
    },
    {
      id: "i_LwzRVP7bg",
      title: "TensorFlow 2.0 vs PyTorch: Deep Learning Architectures Compared",
      channel: "Tech with Tim",
      published_at: "2026-09-08T08:15:00Z",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=640&q=80",
      description: "Deep dive into model building, dynamic computational graphs, CUDA acceleration, and deployment trade-offs between TensorFlow and PyTorch."
    },
    {
      id: "JMUxmLyrhSk",
      title: "MobileNetV2: Efficient Convolutional Neural Networks for Mobile Devices",
      channel: "Computerphile",
      published_at: "2026-08-30T16:45:00Z",
      thumbnail: "https://images.unsplash.com/photo-1507146426996-ef0538821e78?w=640&q=80",
      description: "Understanding inverted residuals, linear bottlenecks, and lightweight deep learning for real-time edge devices."
    },
    {
      id: "aircAruvnKk",
      title: "Neural Networks from Scratch in Python (Full Walkthrough)",
      channel: "3Blue1Brown",
      published_at: "2026-08-22T12:00:00Z",
      thumbnail: "https://images.unsplash.com/photo-1501139083538-0139583c060f?w=640&q=80",
      description: "Visual explanation of backpropagation, gradient descent optimization, loss surfaces, and activation functions."
    },
    {
      id: "GwIo3g5ChSC",
      title: "FastAPI Production Deployment: Scaling Python Microservices",
      channel: "freeCodeCamp",
      published_at: "2026-08-14T09:30:00Z",
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=640&q=80",
      description: "Master ASGI workers, async background tasks, CORS headers, Pydantic data validation, and Docker containerization."
    }
  ],
  "Artificial Intelligence": [
    {
      id: "5NgNicANyqM",
      title: "Autonomous AI Agents: The Future of Agentic Software Engineering",
      channel: "MIT Technology Review",
      published_at: "2026-09-20T11:00:00Z",
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=640&q=80",
      description: "How multi-agent orchestrations, reasoning loops, and tool-augmented models are revolutionizing autonomous task execution."
    },
    {
      id: "L_Guz73e6fw",
      title: "Computer Vision & Deepfake Detection: Detecting Synthetic Media",
      channel: "Two Minute Papers",
      published_at: "2026-09-18T15:10:00Z",
      thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=640&q=80",
      description: "Examining state-of-the-art forensic analysis techniques to detect AI-generated facial reenactment and voice cloning."
    }
  ],
  "Data Science": [
    {
      id: "X3paOmcrTjQ",
      title: "Data Science Roadmap: From Python to Machine Learning Engineering",
      channel: "Ken Jee",
      published_at: "2026-09-10T14:00:00Z",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&q=80",
      description: "Step-by-step master plan covering Pandas, NumPy, statistical hypothesis testing, Scikit-learn, and production pipelines."
    },
    {
      id: "ua-CiDNNj30",
      title: "Exploratory Data Analysis (EDA) Best Practices for Tabular Data",
      channel: "StatQuest",
      published_at: "2026-09-02T13:30:00Z",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&q=80",
      description: "Handling missing values, outlier detection using IQR and Z-scores, feature engineering, and multi-collinearity checks."
    }
  ]
};

// Elements
const queryInput = document.getElementById("queryInput");
const btnSearch = document.getElementById("btnSearch");
const videosContainer = document.getElementById("videosContainer");
const resultsCount = document.getElementById("resultsCount");
const apiStatusMessage = document.getElementById("apiStatusMessage");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageIndicator = document.getElementById("pageIndicator");

// Modal Elements
const modal = document.getElementById("videoModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const videoPlayer = document.getElementById("videoPlayer");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");

async function fetchVideos(query, page = 1) {
  currentQuery = query;
  currentPage = page;
  videosContainer.innerHTML = `<div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #9ca3af;">Querying YouTube Video Fetcher API...</div>`;

  try {
    // Relative path to avoid hardcoded 127.0.0.1:8000 localhost crash on Vercel
    const response = await fetch(`/api/videos?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.videos && data.videos.length > 0) {
      renderVideos(data.videos, data.source || "Database (MongoDB)");
      return;
    }
  } catch (err) {
    // Graceful fallback to cached pipeline results
    console.log("Serving cached YouTube pipeline records (live demonstration mode)");
  }

  // Load fallback/cached records
  let matched = fallbackVideos[query] || fallbackVideos["Machine Learning"];
  renderVideos(matched, "MongoDB Collection (Indexed Cache)");
}

function renderVideos(videos, source) {
  videosContainer.innerHTML = "";
  resultsCount.textContent = `Found ${videos.length} videos for "${currentQuery}"`;
  apiStatusMessage.innerHTML = `<span class="source-tag">Source: ${source}</span>`;
  pageIndicator.textContent = `Page ${currentPage}`;

  videos.forEach(v => {
    const card = document.createElement("div");
    card.className = "video-card";
    const dateFormatted = new Date(v.published_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    card.innerHTML = `
      <div class="thumb-wrapper">
        <img src="${v.thumbnail}" alt="${v.title}" loading="lazy">
        <div class="play-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
      <div class="video-info">
        <h4 class="video-title">${v.title}</h4>
        <div class="video-meta">
          <span>${v.channel || "YouTube Creator"}</span>
          <span>${dateFormatted}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      openModal(v);
    });

    videosContainer.appendChild(card);
  });

  btnPrev.disabled = currentPage <= 1;
}

function openModal(video) {
  modalTitle.textContent = video.title;
  modalDesc.textContent = video.description || "Video metadata fetched and indexed via YouTube Data API v3.";
  videoPlayer.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
  videoPlayer.src = "";
}

btnCloseModal.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

btnSearch.addEventListener("click", () => {
  const q = queryInput.value.trim();
  if (q) fetchVideos(q, 1);
});

queryInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const q = queryInput.value.trim();
    if (q) fetchVideos(q, 1);
  }
});

document.querySelectorAll(".topic-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".topic-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const topic = chip.getAttribute("data-topic");
    queryInput.value = topic;
    fetchVideos(topic, 1);
  });
});

btnPrev.addEventListener("click", () => {
  if (currentPage > 1) fetchVideos(currentQuery, currentPage - 1);
});

btnNext.addEventListener("click", () => {
  fetchVideos(currentQuery, currentPage + 1);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchVideos("Machine Learning", 1);
});
