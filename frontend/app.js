// =========================================================
// FinVerse App.js — Main frontend logic
// =========================================================

// Resolve the API base URL dynamically based on hosting environment
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
  ? 'http://localhost:8000'
  : window.location.origin;

// ---- Toast Notification ----
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerText = message;
  toast.style.borderColor = isError ? '#F2D07C' : '#bcefcc';
  toast.style.color = isError ? '#F2D07C' : '#bcefcc';
  toast.style.boxShadow = isError
    ? '0 10px 40px rgba(242, 208, 124, 0.15)'
    : '0 10px 40px rgba(188, 239, 204, 0.15)';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ---- Helper: Detect Category ----
function detectCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  if (text.includes('crypto') || text.includes('bitcoin') || text.includes('eth') || text.includes('blockchain') || text.includes('coin')) {
    return { name: 'Crypto', slug: 'crypto' };
  }
  if (text.includes('inflation') || text.includes('fed') || text.includes('macro') || text.includes('rate cut') || text.includes('imf') || text.includes('gdp')) {
    return { name: 'Macroeconomics', slug: 'macro' };
  }
  if (text.includes('budget') || text.includes('savings') || text.includes('personal finance') || text.includes('tax') || text.includes('salary') || text.includes('net worth')) {
    return { name: 'Personal Finance', slug: 'personal' };
  }
  return { name: 'Markets', slug: 'markets' };
}

// ---- Helper: Reading Time ----
function calculateReadTime(text) {
  const wordsPerMinute = 225;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);
  return `${time} min read`;
}

// ---- Helper: Format Date ----
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

// ---- Helper: Generate Persistent Avatar Color ----
function stringToHslColor(str, s = 65, l = 45) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ---- Global state for blog list page ----
let allPostsCache = [];
let currentCategoryFilter = 'all';
let currentSearchQuery = '';


// =========================================================
// BLOGS.HTML — Magazine Layout Rendering
// =========================================================

function renderMagazineLayout(posts) {
  const featuredWrap = document.getElementById('featuredPostWrap');
  const articlesContainer = document.getElementById('articlesListContainer');
  const articlesSection = document.getElementById('articlesSection');
  const newsTicker = document.getElementById('newsTicker');

  if (!featuredWrap || !articlesContainer) return;

  if (posts.length === 0) {
    featuredWrap.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-newspaper"></i>
        <h3>No Insights Found</h3>
        <p>No financial articles match your current search or filter. Try a different keyword or category.</p>
      </div>
    `;
    articlesContainer.innerHTML = '';
    if (articlesSection) articlesSection.style.display = 'none';
    return;
  }

  if (articlesSection) articlesSection.style.display = '';

  // --- Featured Post (index 0) ---
  const featured = posts[0];
  const featuredStripped = featured.content.replace(/<\/?[^>]+(>|$)/g, '');
  const featuredExcerpt = featuredStripped.length > 220 ? featuredStripped.substring(0, 220) + '...' : featuredStripped;
  const featuredCat = detectCategory(featured.title, featured.content);
  const featuredReadTime = calculateReadTime(featuredStripped);

  featuredWrap.innerHTML = `
    <div class="featured-post-card" onclick="window.location.href='post.html?id=${featured.id}'">
      <div class="featured-post-visual">
        <i class="fa-solid fa-chart-line big-icon"></i>
        <div class="featured-rank-badge">
          <i class="fa-solid fa-star" style="font-size: 0.6rem;"></i> Featured Insight
        </div>
      </div>
      <div class="featured-post-content">
        <div>
          <span class="featured-cat-tag">${featuredCat.name}</span>
          <h2 class="featured-post-title">${featured.title}</h2>
          <p class="featured-post-excerpt">${featuredExcerpt}</p>
        </div>
        <div class="featured-post-footer">
          <div class="featured-meta">
            <div><i class="fa-regular fa-calendar"></i> ${formatDate(featured.created_at)}</div>
            <div><i class="fa-regular fa-clock"></i> ${featuredReadTime}</div>
          </div>
          <a href="post.html?id=${featured.id}" class="featured-read-btn" onclick="event.stopPropagation();">
            Read Full Report <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  // --- Ticker (use post titles) ---
  if (newsTicker && posts.length > 0) {
    const tickerTrack = document.getElementById('tickerTrack');
    if (tickerTrack) {
      // Duplicate for seamless loop
      const items = [...posts, ...posts].map(p => `
        <span class="ticker-item"><span class="dot"></span>${p.title}</span>
      `).join('');
      tickerTrack.innerHTML = items;
      newsTicker.style.display = '';
    }
  }

  // --- Rest of Posts as Ranked List ---
  const restPosts = posts.slice(1);

  if (restPosts.length === 0) {
    articlesContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem 0;">No more insights to display.</p>';
    return;
  }

  articlesContainer.innerHTML = '';
  restPosts.forEach((post, index) => {
    const rank = index + 2; // since featured is #1
    const stripped = post.content.replace(/<\/?[^>]+(>|$)/g, '');
    const excerpt = stripped.length > 130 ? stripped.substring(0, 130) + '...' : stripped;
    const cat = detectCategory(post.title, post.content);
    const readTime = calculateReadTime(stripped);

    const item = document.createElement('div');
    item.className = 'article-list-item';
    item.setAttribute('onclick', `window.location.href='post.html?id=${post.id}'`);

    item.innerHTML = `
      <div class="article-rank-num ${rank <= 3 ? 'top3' : ''}">${String(rank).padStart(2, '0')}</div>
      <div class="article-info">
        <div class="article-info-header">
          <span class="article-tag">${cat.name}</span>
          <span class="article-date"><i class="fa-regular fa-calendar"></i> ${formatDate(post.created_at)}</span>
        </div>
        <div class="article-title">${post.title}</div>
        <div class="article-excerpt">${excerpt}</div>
      </div>
      <div class="article-cta">
        <span class="read-time-badge"><i class="fa-regular fa-clock"></i> ${readTime}</span>
        <i class="fa-solid fa-arrow-right read-more-arrow"></i>
      </div>
    `;

    // Staggered entrance animation
    item.style.opacity = '0';
    item.style.transform = 'translateX(-15px)';
    item.style.transition = `opacity 0.4s ease ${index * 0.06}s, transform 0.4s ease ${index * 0.06}s`;
    articlesContainer.appendChild(item);

    requestAnimationFrame(() => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 30);
    });
  });
}

function filterAndRenderMagazine() {
  const filtered = allPostsCache.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(currentSearchQuery) ||
                          post.content.toLowerCase().includes(currentSearchQuery);
    if (currentCategoryFilter === 'all') return matchesSearch;
    const cat = detectCategory(post.title, post.content);
    return matchesSearch && cat.slug === currentCategoryFilter;
  });
  renderMagazineLayout(filtered);
}

async function fetchAndRenderBlogs() {
  try {
    const res = await fetch(`${API_BASE}/posts/`);
    if (!res.ok) throw new Error('Server error');
    const posts = await res.json();
    allPostsCache = posts;
    filterAndRenderMagazine();
  } catch (err) {
    const featuredWrap = document.getElementById('featuredPostWrap');
    if (featuredWrap) {
      featuredWrap.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Connection Error</h3>
          <p>Unable to reach the FinVerse API server. Please ensure the backend is running and try refreshing the page.</p>
        </div>
      `;
    }
    showToast('Failed to connect to the server.', true);
  }
}


// =========================================================
// BLOGS.HTML — Quiz Gate + Init
// =========================================================

if (window.location.pathname.includes('blogs.html')) {
  const quizPassed = localStorage.getItem('quizPassed') === 'true';

  if (!quizPassed) {
    // Show quiz lock screen
    const wrapper = document.getElementById('blog-wrapper');
    const ticker = document.getElementById('newsTicker');
    if (ticker) ticker.remove();
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="max-width: 650px; margin: 60px auto; text-align: center; border: 1px solid var(--secondary-color-dim);" class="card visible">
          <div style="font-size: 5rem; color: var(--secondary-color); margin-bottom: 2rem; filter: drop-shadow(0 0 15px var(--secondary-color-dim));">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 style="font-size: 2.3rem; margin-bottom: 1rem; color: var(--text-primary); font-family: 'Syne', sans-serif;">Research Insights Locked</h2>
          <p style="color: var(--text-secondary); font-size: 1.15rem; line-height: 1.7; margin-bottom: 2.5rem; font-family: 'Outfit', sans-serif; max-width: 500px; margin-left: auto; margin-right: auto;">
            To maintain premium reporting quality, please prove your knowledge by scoring <strong style="color: #fff;">8 or above</strong> on the Finance Basics Quiz.
          </p>
          <div style="background: rgba(242, 208, 124, 0.07); border: 1px solid var(--secondary-color-dim); border-radius: 100px; padding: 0.9rem 2.5rem; color: var(--secondary-color); font-weight: 600; display: inline-block; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;">
            Redirecting to Quiz in <span id="countdown-timer" style="font-weight: 800; color: #fff;">15</span>s...
          </div>
          <div style="margin-top: 1.5rem;">
            <a href="learn.html" class="btn" style="text-decoration: none; display: inline-block; padding: 1.1rem 3rem;">Unlock Quiz Now</a>
          </div>
        </div>
      `;
    }

    let secondsRemaining = 15;
    const interval = setInterval(() => {
      secondsRemaining--;
      const timerSpan = document.getElementById('countdown-timer');
      if (timerSpan) timerSpan.innerText = secondsRemaining;
      if (secondsRemaining <= 0) {
        clearInterval(interval);
        window.location.href = 'learn.html';
      }
    }, 1000);

  } else {
    // Quiz passed — init search, filters, and fetch blogs
    document.addEventListener('DOMContentLoaded', () => {
      const searchInput = document.getElementById('blogSearch');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearchQuery = e.target.value.toLowerCase().trim();
          filterAndRenderMagazine();
        });
      }

      const categoryContainer = document.getElementById('categoryFilters');
      if (categoryContainer) {
        categoryContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.category-pill');
          if (!btn) return;
          categoryContainer.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          currentCategoryFilter = btn.dataset.category;
          filterAndRenderMagazine();
        });
      }

      fetchAndRenderBlogs();
    });
  }
}


// =========================================================
// POST.HTML — Blog Detail View
// =========================================================

let currentPostId = null;

if (window.location.pathname.includes('post.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    const quizPassed = localStorage.getItem('quizPassed') === 'true';

    if (!quizPassed) {
      const wrapper = document.getElementById('blog-wrapper');
      if (wrapper) {
        wrapper.innerHTML = `
          <div style="max-width: 650px; margin: 60px auto; text-align: center; border: 1px solid var(--secondary-color-dim);" class="card visible">
            <div style="font-size: 5rem; color: var(--secondary-color); margin-bottom: 2rem; filter: drop-shadow(0 0 15px var(--secondary-color-dim));">
              <i class="fa-solid fa-lock"></i>
            </div>
            <h2 style="font-size: 2.3rem; margin-bottom: 1rem; color: var(--text-primary); font-family: 'Syne', sans-serif;">Research Insights Locked</h2>
            <p style="color: var(--text-secondary); font-size: 1.15rem; line-height: 1.7; margin-bottom: 2.5rem; font-family: 'Outfit', sans-serif; max-width: 500px; margin-left: auto; margin-right: auto;">
              To maintain premium reporting quality, please prove your knowledge by scoring <strong style="color: #fff;">8 or above</strong> on the Finance Basics Quiz.
            </p>
            <div style="background: rgba(242, 208, 124, 0.07); border: 1px solid var(--secondary-color-dim); border-radius: 100px; padding: 0.9rem 2.5rem; color: var(--secondary-color); font-weight: 600; display: inline-block; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;">
              Redirecting to Quiz in <span id="countdown-timer" style="font-weight: 800; color: #fff;">15</span>s...
            </div>
            <div style="margin-top: 1.5rem;">
              <a href="learn.html" class="btn" style="text-decoration: none; display: inline-block; padding: 1.1rem 3rem;">Unlock Quiz Now</a>
            </div>
          </div>
        `;
      }

      let secondsRemaining = 15;
      const interval = setInterval(() => {
        secondsRemaining--;
        const timerSpan = document.getElementById('countdown-timer');
        if (timerSpan) timerSpan.innerText = secondsRemaining;
        if (secondsRemaining <= 0) {
          clearInterval(interval);
          window.location.href = 'learn.html';
        }
      }, 1000);

    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get('id');

      if (postId) {
        loadPostDetail(postId);
      } else {
        window.location.href = 'blogs.html';
      }
    }
  });
}


// =========================================================
// POST DETAIL — Load & render full article
// =========================================================

async function loadPostDetail(id) {
  currentPostId = id;
  
  const titleEl = document.getElementById('detail-title');
  const dateEl = document.getElementById('detail-date');
  const readTimeEl = document.getElementById('detail-readtime');
  const catSpan = document.getElementById('detail-category');
  const contentEl = document.getElementById('detail-content');
  const likesEl = document.getElementById('post-likes');
  const dislikesEl = document.getElementById('post-dislikes');

  try {
    const res = await fetch(`${API_BASE}/posts/${id}`);
    if (!res.ok) throw new Error('Post not found (status ' + res.status + ')');
    const post = await res.json();

    // Populate header
    if (titleEl) titleEl.innerText = post.title;
    if (dateEl) dateEl.innerText = new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    // Calculate reading time
    const strippedContent = post.content.replace(/<\/?[^>]+(>|$)/g, '');
    if (readTimeEl) readTimeEl.innerText = calculateReadTime(strippedContent);

    // Category
    const cat = detectCategory(post.title, post.content);
    if (catSpan) {
      catSpan.innerText = cat.name;
      if (cat.slug === 'crypto') {
        catSpan.style.background = 'rgba(242, 208, 124, 0.15)';
        catSpan.style.color = 'var(--secondary-color)';
        catSpan.style.borderColor = 'rgba(242, 208, 124, 0.2)';
      }
    }

    // Content
    if (contentEl) {
      contentEl.innerHTML = post.content || '<p style="color:var(--text-secondary)">No content available.</p>';
    }

    // Reactions
    if (likesEl) likesEl.innerText = post.likes || 0;
    if (dislikesEl) dislikesEl.innerText = post.dislikes || 0;

    // Comments
    if (post.comments) renderComments(post.comments);

    // Comment form submit
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
      commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const author_name = document.getElementById('commentName').value.trim();
        const content = document.getElementById('commentContent').value.trim();
        const body = { post_id: parseInt(id), author_name, content };

        try {
          const cRes = await fetch(`${API_BASE}/comments/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!cRes.ok) throw new Error('Failed');
          const newComment = await cRes.json();
          post.comments.push(newComment);
          renderComments(post.comments);
          commentForm.reset();
          showToast('View posted successfully!');
        } catch (err) {
          showToast('Failed to post comment. Is backend running?', true);
        }
      };
    }

  } catch (err) {
    console.error('loadPostDetail error:', err);
    if (titleEl) titleEl.innerText = 'Post Not Found';
    if (contentEl) contentEl.innerHTML = `
      <div style="text-align:center; padding: 3rem 0;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:var(--secondary-color); margin-bottom:1rem;"></i>
        <p style="color:var(--text-secondary); font-size: 1.1rem;">Could not load this article. The backend server may be offline, or this post may have been deleted.</p>
        <a href="blogs.html" style="color:var(--primary-color); display:inline-block; margin-top:1.5rem; font-weight:600;">← Back to Insights</a>
      </div>
    `;
  }
}


// =========================================================
// COMMENTS — Render thread
// =========================================================

function renderComments(comments) {
  const container = document.getElementById('comments-list');
  const countTitle = document.getElementById('comments-count-title');

  if (countTitle) countTitle.innerText = `Views & Reviews (${comments.length})`;
  if (!container) return;
  container.innerHTML = '';

  if (comments.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 2rem 0; border: 1px dashed var(--glass-border); border-radius: 20px;">No views yet. Be the first to share your outlook!</p>';
    return;
  }

  comments.forEach(c => {
    const card = document.createElement('div');
    card.className = 'comment-card';
    const initials = c.author_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    const avatarColor = stringToHslColor(c.author_name);
    const dateStr = new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    card.innerHTML = `
      <div class="avatar-circle" style="background-color: ${avatarColor};">${initials}</div>
      <div class="comment-body">
        <div class="comment-author-meta">
          <span class="comment-author-name">${c.author_name}</span>
          <span class="comment-date">${dateStr}</span>
        </div>
        <p class="comment-txt">${c.content}</p>
        <div class="comment-reactions">
          <button onclick="handleCommentReaction(${c.id}, 'like')" class="comment-react-btn">
            <i class="fa-solid fa-thumbs-up"></i> 
            <span id="comment-likes-${c.id}">${c.likes || 0}</span>
          </button>
          <button onclick="handleCommentReaction(${c.id}, 'dislike')" class="comment-react-btn">
            <i class="fa-solid fa-thumbs-down"></i> 
            <span id="comment-dislikes-${c.id}">${c.dislikes || 0}</span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}


// =========================================================
// REACTIONS — Post & Comment
// =========================================================

async function handlePostReaction(action) {
  if (!currentPostId) return;
  const likeBtn = document.getElementById('postLikeBtn');
  const dislikeBtn = document.getElementById('postDislikeBtn');

  try {
    const res = await fetch(`${API_BASE}/posts/${currentPostId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Reaction failed');
    const data = await res.json();
    document.getElementById('post-likes').innerText = data.likes;
    document.getElementById('post-dislikes').innerText = data.dislikes;

    if (action === 'like') {
      likeBtn.classList.add('active-like');
      dislikeBtn.classList.remove('active-dislike');
      showToast('Liked this insight!');
    } else {
      dislikeBtn.classList.add('active-dislike');
      likeBtn.classList.remove('active-like');
      showToast('Disliked this insight.');
    }
  } catch (err) {
    showToast('Failed to react to post. Is backend running?', true);
  }
}

async function handleCommentReaction(commentId, action) {
  try {
    const res = await fetch(`${API_BASE}/comments/${commentId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Reaction failed');
    const data = await res.json();
    document.getElementById(`comment-likes-${commentId}`).innerText = data.likes;
    document.getElementById(`comment-dislikes-${commentId}`).innerText = data.dislikes;
    showToast('Reacted to view.');
  } catch (err) {
    showToast('Failed to react to view.', true);
  }
}


// =========================================================
// SUBSCRIBE & CONTACT FORMS
// =========================================================

const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('subEmail').value;
    try {
      const res = await fetch(`${API_BASE}/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        let errMsg = 'Error subscribing. Try again.';
        if (data && data.detail) {
          errMsg = Array.isArray(data.detail) ? data.detail.map(err => err.msg).join(', ') : data.detail;
        } else if (data && data.message) {
          errMsg = data.message;
        }
        showToast(errMsg, true);
        return;
      }
      showToast(data.message || 'Subscribed successfully!');
      subscribeForm.reset();
    } catch (err) {
      showToast('Error subscribing. Try again.', true);
    }
  });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contactMethodInput = document.querySelector('input[name="contactMethod"]:checked');
    const body = {
      name: document.getElementById('contactName').value,
      phone: document.getElementById('contactPhone').value,
      email: document.getElementById('contactEmail').value,
      preferred_contact: contactMethodInput ? contactMethodInput.value : null,
      review: document.getElementById('contactReview').value
    };
    try {
      const res = await fetch(`${API_BASE}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        let errMsg = 'Error saving data.';
        if (data && data.detail) {
          errMsg = Array.isArray(data.detail) ? data.detail.map(err => err.msg).join(', ') : data.detail;
        }
        showToast(errMsg, true);
        return;
      }
      showToast(data.message || 'Saved successfully!');
      contactForm.reset();
    } catch (err) {
      showToast('Error saving data.', true);
    }
  });
}
