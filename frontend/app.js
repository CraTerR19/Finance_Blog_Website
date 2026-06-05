// Resolve the API base URL dynamically based on hosting environment
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
  ? 'http://localhost:8000'
  : window.location.origin;

function showToast(message) {
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
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
          if (Array.isArray(data.detail)) {
            errMsg = data.detail.map(err => err.msg).join(', ');
          } else {
            errMsg = data.detail;
          }
        } else if (data && data.message) {
          errMsg = data.message;
        }
        showToast(errMsg);
        return;
      }
      showToast(data.message || 'Subscribed successfully!');
      subscribeForm.reset();
    } catch(err) {
      showToast('Error subscribing. Try again.');
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
          if (Array.isArray(data.detail)) {
            errMsg = data.detail.map(err => err.msg).join(', ');
          } else {
            errMsg = data.detail;
          }
        } else if (data && data.message) {
          errMsg = data.message;
        }
        showToast(errMsg);
        return;
      }
      showToast(data.message || 'Saved successfully!');
      contactForm.reset();
    } catch(err) {
      showToast('Error saving data.');
    }
  });
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
  }

  container.innerHTML = '';
  
  if(posts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); width: 100%;">No posts yet. Check back later!</p>';
    return;
  }
  
  const postsToShow = limit ? posts.slice(0, limit) : posts;
  
  postsToShow.forEach((post, index) => {
    const card = document.createElement('div');
    card.className = 'card visible'; // Visible instantly for now
    card.style.animationDelay = `${index * 0.1}s`;
    
    const date = new Date(post.created_at).toLocaleDateString();
    const strippedContent = post.content.replace(/<\/?[^>]+(>|$)/g, "");
    card.innerHTML = `
      <h3>${post.title}</h3>
      <p style="font-size:0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">${date}</p>
      <p style="color: var(--text-secondary);">${strippedContent.substring(0, 200)}...</p>
      <a href="blogs.html?id=${post.id}" style="color: var(--primary-color); text-decoration:none; font-weight:600; display: inline-block; margin-top: 1rem;">Read More →</a>
    `;
    container.appendChild(card);
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
        <div style="max-width: 600px; margin: 40px auto; text-align: center;" class="card visible">
          <div style="font-size: 4rem; color: var(--secondary-color); margin-bottom: 1.5rem;">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-primary); font-family: 'Syne', sans-serif;">Access Locked</h2>
          <p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.3rem; font-family: 'Outfit', sans-serif;">
            You must score at least 8 on the Finance Basics Quiz to unlock the blogs and read detailed market research.
          </p>
          <div style="background: rgba(242, 208, 124, 0.1); border: 1px solid var(--secondary-color-dim); border-radius: 100px; padding: 0.8rem 2rem; color: var(--secondary-color); font-weight: 600; display: inline-block; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em;">
            Redirecting in <span id="countdown-timer" style="font-weight: 800; color: #fff;">15</span> seconds...
          </div>
          <div style="margin-top: 2.5rem;">
            <a href="learn.html" class="btn" style="text-decoration: none; display: inline-block;">Go to Quiz Now</a>
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
      document.getElementById('blog-list-view').style.display = 'none';
      document.getElementById('blog-detail-view').style.display = 'block';
      loadPostDetail(postId);
    } else {
      document.getElementById('blog-list-view').style.display = 'block';
      document.getElementById('blog-detail-view').style.display = 'none';
      fetchPosts('allPostsGrid');
    }
  }
}

let currentPostId = null;

async function loadPostDetail(id) {
  currentPostId = id;
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`);
    if(!res.ok) throw new Error('Not found');
    const post = await res.json();
    
    document.getElementById('detail-title').innerText = post.title;
    document.getElementById('detail-date').innerText = new Date(post.created_at).toLocaleDateString();
    document.getElementById('detail-content').innerHTML = post.content;
    document.getElementById('post-likes').innerText = post.likes || 0;
    document.getElementById('post-dislikes').innerText = post.dislikes || 0;
    
    renderComments(post.comments);

    const commentForm = document.getElementById('commentForm');
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const body = {
        post_id: parseInt(id),
        author_name: document.getElementById('commentName').value,
        content: document.getElementById('commentContent').value
      };
      const cRes = await fetch(`${API_BASE}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const newComment = await cRes.json();
      post.comments.push(newComment);
      renderComments(post.comments);
      commentForm.reset();
      showToast('View posted!');
    };
  } catch(err) {
    document.getElementById('detail-title').innerText = "Post not found";
    document.getElementById('detail-content').innerText = "Could not load the post.";
  }
}

function renderComments(comments) {
  const container = document.getElementById('comments-list');
  container.innerHTML = '';
  if(comments.length === 0) {
    container.innerHTML = '<p style="color:var(--text-secondary)">No views yet. Be the first to comment!</p>';
    return;
  }
  comments.forEach(c => {
    const box = document.createElement('div');
    box.className = 'comment-box';
    box.style.marginBottom = "1.5rem";
    box.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
    box.style.paddingBottom = "1rem";
    
    box.innerHTML = `
      <strong>${c.author_name}</strong> <span style="font-size:0.8rem; color:var(--text-secondary); margin-left:1rem;">${new Date(c.created_at).toLocaleDateString()}</span>
      <p style="margin-top:0.5rem; margin-bottom: 0.8rem;">${c.content}</p>
      <div style="display: flex; gap: 0.8rem;">
        <button onclick="handleCommentReaction(${c.id}, 'like')" style="cursor: pointer; background: transparent; border: none; color: var(--text-secondary); display: flex; align-items: center; gap: 0.3rem;"><i class="fa-solid fa-thumbs-up"></i> <span id="comment-likes-${c.id}">${c.likes || 0}</span></button>
        <button onclick="handleCommentReaction(${c.id}, 'dislike')" style="cursor: pointer; background: transparent; border: none; color: var(--text-secondary); display: flex; align-items: center; gap: 0.3rem;"><i class="fa-solid fa-thumbs-down"></i> <span id="comment-dislikes-${c.id}">${c.dislikes || 0}</span></button>
      </div>
    `;
    container.appendChild(box);
  });
}

// Youtube-Style Reactions
async function handlePostReaction(action) {
  if(!currentPostId) return;
  try {
    const res = await fetch(`${API_BASE}/posts/${currentPostId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    document.getElementById('post-likes').innerText = data.likes;
    document.getElementById('post-dislikes').innerText = data.dislikes;
  } catch(err) {
    showToast('Failed to react to post. Is backend running?');
  }
}

async function handleCommentReaction(commentId, action) {
  try {
    const res = await fetch(`${API_BASE}/comments/${commentId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    document.getElementById(`comment-likes-${commentId}`).innerText = data.likes;
    document.getElementById(`comment-dislikes-${commentId}`).innerText = data.dislikes;
  } catch(err) {
    showToast('Failed to react to view.');
  }
}
