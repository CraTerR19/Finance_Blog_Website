// Resolve the API base URL dynamically based on hosting environment
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
  ? 'http://localhost:8000'
  : window.location.origin;

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.innerText = message;
  
  // Custom styled notifications
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

// Helper: Determine category based on content keywords
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

// Helper: Calculate reading time
function calculateReadTime(text) {
  const wordsPerMinute = 225;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);
  return `${time} min read`;
}

// Global posts cache for filtering
let allPostsCache = [];
let currentCategoryFilter = 'all';
let currentSearchQuery = '';

// Render posts helper
function renderPosts(posts, container) {
  container.innerHTML = '';
  
  if (posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-folder-open"></i>
        <h3>No Insights Found</h3>
        <p>We couldn't find any financial insights matching your query. Check back later or adjust your filters.</p>
      </div>
    `;
    return;
  }
  
  posts.forEach((post, index) => {
    const card = document.createElement('div');
    card.className = 'card visible';
    card.style.animationDelay = `${index * 0.08}s`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    
    const date = new Date(post.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Strip HTML tags for preview snippet
    const strippedContent = post.content.replace(/<\/?[^>]+(>|$)/g, "");
    const previewText = strippedContent.length > 180 ? strippedContent.substring(0, 180) + '...' : strippedContent;
    const cat = detectCategory(post.title, post.content);
    const readTime = calculateReadTime(strippedContent);

    card.innerHTML = `
      <div class="blog-card-meta">
        <span class="blog-card-tag">${cat.name}</span>
        <span>•</span>
        <span>${date}</span>
      </div>
      <h3>${post.title}</h3>
      <p style="color: var(--text-secondary); margin-bottom: 2rem; font-size: 1.05rem;">${previewText}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <a href="post.html?id=${post.id}" style="color: var(--primary-color); text-decoration:none; font-weight:600; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.9rem;">Read More →</a>
        <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="fa-regular fa-clock" style="margin-right: 5px;"></i>${readTime}</span>
      </div>
    `;
    
    container.appendChild(card);
    // Trigger animation frame
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 50);
  });
}

// Filter and render active cache
function filterAndRenderCache() {
  const container = document.getElementById('allPostsGrid');
  if (!container) return;

  const filtered = allPostsCache.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(currentSearchQuery) || 
                          post.content.toLowerCase().includes(currentSearchQuery);
    
    if (currentCategoryFilter === 'all') {
      return matchesSearch;
    } else {
      const cat = detectCategory(post.title, post.content);
      return matchesSearch && cat.slug === currentCategoryFilter;
    }
  });

  renderPosts(filtered, container);
}

// Fetch Posts
async function fetchPosts(elementId, limit = null) {
  const container = document.getElementById(elementId);
  if(!container) return;
  
  let posts = [];
  try {
    const res = await fetch(`${API_BASE}/posts/`);
    if(res.ok) {
      posts = await res.json();
    }
  } catch(err) {
    console.warn('Backend fetch failed.');
    showToast('Failed to connect to backend server.', true);
  }

  container.innerHTML = '';
  
  if(posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-newspaper"></i>
        <h3>No Insights Yet</h3>
        <p>There are currently no financial articles published. Admin will publish new reports shortly.</p>
      </div>
    `;
    return;
  }
  
  if (elementId === 'allPostsGrid') {
    allPostsCache = posts;
    filterAndRenderCache();
  } else {
    // Recent posts on homepage
    const postsToShow = limit ? posts.slice(0, limit) : posts;
    renderPosts(postsToShow, container);
  }
}

// Subscribe Form
const subscribeForm = document.getElementById('subscribeForm');
if(subscribeForm) {
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
    } catch(err) {
      showToast('Error subscribing. Try again.', true);
    }
  });
}

// Contact Form
const contactForm = document.getElementById('contactForm');
if(contactForm) {
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
        } else if (data && data.message) {
          errMsg = data.message;
        }
        showToast(errMsg, true);
        return;
      }
      showToast(data.message || 'Saved successfully!');
      contactForm.reset();
    } catch(err) {
      showToast('Error saving data.', true);
    }
  });
}

// Load views
if(document.getElementById('recentPostsGrid')) {
  fetchPosts('recentPostsGrid', 3);
}

// Blog Routing logic
if(window.location.pathname.includes('blogs.html')) {
  const quizPassed = localStorage.getItem('quizPassed') === 'true';
  if (!quizPassed) {
    const wrapper = document.getElementById('blog-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="max-width: 650px; margin: 40px auto; text-align: center; border: 1px solid var(--secondary-color-dim);" class="card visible">
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
      if (timerSpan) {
        timerSpan.innerText = secondsRemaining;
      }
      if (secondsRemaining <= 0) {
        clearInterval(interval);
        window.location.href = "learn.html";
      }
    }, 1000);
  } else {
    // Pass check, init search and filtering hooks
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        filterAndRenderCache();
      });
    }

    const categoryContainer = document.getElementById('categoryFilters');
    if (categoryContainer) {
      categoryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-pill');
        if (!btn) return;
        
        // Remove active from all pills
        categoryContainer.querySelectorAll('.category-pill').forEach(pill => {
          pill.classList.remove('active');
        });
        
        btn.classList.add('active');
        currentCategoryFilter = btn.dataset.category;
        filterAndRenderCache();
      });
    }

    // Initial load
    fetchPosts('allPostsGrid');
  }
}

// Blog Routing logic for post.html page
if(window.location.pathname.includes('post.html')) {
  const quizPassed = localStorage.getItem('quizPassed') === 'true';
  if (!quizPassed) {
    const wrapper = document.getElementById('blog-wrapper');
    if (wrapper) {
      wrapper.innerHTML = `
        <div style="max-width: 650px; margin: 40px auto; text-align: center; border: 1px solid var(--secondary-color-dim);" class="card visible">
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
      if (timerSpan) {
        timerSpan.innerText = secondsRemaining;
      }
      if (secondsRemaining <= 0) {
        clearInterval(interval);
        window.location.href = "learn.html";
      }
    }, 1000);
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if(postId) {
      loadPostDetail(postId);
    } else {
      window.location.href = "blogs.html";
    }
  }
}

let currentPostId = null;

// Helper: Generates a persistent aesthetic color based on string hash
function stringToHslColor(str, s = 65, l = 45) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

async function loadPostDetail(id) {
  currentPostId = id;
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`);
    if(!res.ok) throw new Error('Not found');
    const post = await res.json();
    
    // Set content dynamically
    document.getElementById('detail-title').innerText = post.title;
    
    const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('detail-date').innerText = formattedDate;
    
    // Calculate and set reading time
    const strippedContent = post.content.replace(/<\/?[^>]+(>|$)/g, "");
    document.getElementById('detail-readtime').innerText = calculateReadTime(strippedContent);
    
    // Detect Category
    const cat = detectCategory(post.title, post.content);
    const catSpan = document.getElementById('detail-category');
    if (catSpan) {
      catSpan.innerText = cat.name;
      // Change color dynamically depending on the category
      if (cat.slug === 'crypto') {
        catSpan.style.background = 'rgba(242, 208, 124, 0.15)';
        catSpan.style.color = 'var(--secondary-color)';
        catSpan.style.borderColor = 'rgba(242, 208, 124, 0.2)';
      }
    }
    
    document.getElementById('detail-content').innerHTML = post.content;
    document.getElementById('post-likes').innerText = post.likes || 0;
    document.getElementById('post-dislikes').innerText = post.dislikes || 0;
    
    renderComments(post.comments);

    // Form logic
    const commentForm = document.getElementById('commentForm');
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const author_name = document.getElementById('commentName').value.trim();
      const content = document.getElementById('commentContent').value.trim();
      
      const body = {
        post_id: parseInt(id),
        author_name,
        content
      };
      
      try {
        const cRes = await fetch(`${API_BASE}/comments/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        if (!cRes.ok) throw new Error('Fail');
        
        const newComment = await cRes.json();
        post.comments.push(newComment);
        renderComments(post.comments);
        commentForm.reset();
        showToast('View posted successfully!');
      } catch(err) {
        showToast('Failed to post comment. Is backend running?', true);
      }
    };
  } catch(err) {
    document.getElementById('detail-title').innerText = "Post not found";
    document.getElementById('detail-content').innerHTML = `<p style="color:var(--text-secondary)">Could not load the post. Ensure the backend server is running.</p>`;
  }
}

function renderComments(comments) {
  const container = document.getElementById('comments-list');
  const countTitle = document.getElementById('comments-count-title');
  
  if (countTitle) {
    countTitle.innerText = `Views & Reviews (${comments.length})`;
  }
  
  container.innerHTML = '';
  if(comments.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 2rem 0; border: 1px dashed var(--glass-border); border-radius: 20px;">No views yet. Be the first to share your outlook!</p>';
    return;
  }
  
  comments.forEach(c => {
    const card = document.createElement('div');
    card.className = 'comment-card';
    
    const initials = c.author_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    const avatarColor = stringToHslColor(c.author_name);
    
    const dateStr = new Date(c.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
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

// Youtube-Style Reactions
async function handlePostReaction(action) {
  if(!currentPostId) return;
  
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
    
    // Dynamic Active styling
    if (action === 'like') {
      likeBtn.classList.add('active-like');
      dislikeBtn.classList.remove('active-dislike');
      showToast('Liked this insight!');
    } else {
      dislikeBtn.classList.add('active-dislike');
      likeBtn.classList.remove('active-like');
      showToast('Disliked this insight.');
    }
  } catch(err) {
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
  } catch(err) {
    showToast('Failed to react to view.', true);
  }
}
