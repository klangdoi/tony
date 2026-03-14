// script.js
document.addEventListener('DOMContentLoaded', () => {
  const varietiesGrid = document.getElementById('varietiesGrid');
  const searchInput = document.getElementById('searchInput');
  let allVarieties = [];

  // โหลด metadata
  fetch('fig_metadata.json')
    .then(res => res.json())
    .then(data => {
      allVarieties = data.varieties;
      renderVarieties(allVarieties);
    })
    .catch(err => {
      console.error('ไม่สามารถโหลด metadata ได้:', err);
      varietiesGrid.innerHTML = '<p>⚠️ ไม่พบไฟล์ fig_metadata.json</p>';
    });

  function renderVarieties(varieties) {
    varietiesGrid.innerHTML = varieties.map(v => `
      <div class="card">
        <div class="card-img">
          <img src="${v.main_image}" alt="${v.name_th}" onerror="this.src='https://via.placeholder.com/300x180?text=ภาพไม่พบ'">
        </div>
        <div class="card-body">
          <h3 class="card-title">${v.name_th}</h3>
          ${v.detail_image ? 
            `<a href="${v.detail_image}" class="card-detail-btn" target="_blank">ดูภาพละเอียด</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // ฟังก์ชันค้นหา
  window.filterVarieties = () => {
    const term = searchInput.value.toLowerCase();
    const filtered = allVarieties.filter(v => 
      v.name_th.toLowerCase().includes(term) || 
      v.id.toLowerCase().includes(term)
    );
    renderVarieties(filtered);
  };

  // ฟังก์ชัน filter ตามหมวด
  window.filterByCategory = (cat) => {
    const filtered = allVarieties.filter(v => v.category === cat);
    renderVarieties(filtered);
  };

  window.showAll = () => {
    renderVarieties(allVarieties);
  };

  // ค้นหาเมื่อกด Enter
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') filterVarieties();
  });
});