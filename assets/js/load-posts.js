// load-posts.js
// Usage: include with <script src="assets/js/load-posts.js" data-theme="theme-slug"></script>
(function () {
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  var script = document.currentScript || (function(){
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-1];
  })();
  var theme = script && script.getAttribute('data-theme');
  var container = document.getElementById('posts-list');
  if (!container) return;
  container.textContent = 'Loading posts…';

  fetch('posts/index.json', {cache: 'no-store'})
    .then(function (r) { if (!r.ok) throw new Error('Network response was not ok'); return r.json(); })
    .then(function (posts) {
      var filtered = posts.filter(function(p){ return p.theme === theme; });
      if (!filtered.length) {
        container.innerHTML = '<p>No posts found for this theme yet.</p>';
        return;
      }
      var ul = document.createElement('ul');
      filtered.sort(function(a,b){ return b.date.localeCompare(a.date); });
      filtered.forEach(function(p){
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = p.path;
        a.textContent = p.title;
        var time = document.createElement('time');
        time.dateTime = p.date;
        time.textContent = p.date;
        li.appendChild(a);
        li.appendChild(document.createTextNode(' — '));
        li.appendChild(time);
        if (p.excerpt) {
          var br = document.createElement('br');
          var ex = document.createElement('small');
          ex.innerHTML = escapeHtml(p.excerpt);
          li.appendChild(br);
          li.appendChild(ex);
        }
        ul.appendChild(li);
      });
      container.innerHTML = '';
      container.appendChild(ul);
    })
    .catch(function (err) {
      container.innerHTML = '<p>Unable to load posts. ' + escapeHtml(String(err.message)) + '</p>';
    });
})();
