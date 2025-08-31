// Enhanced Photo Gallery with Advanced Features

// Sample photo data: Mathura Refinery images from the web
const photos = [
  {
    id: 1,
    name: "Mathura_Refinery_Garden.jpg",
    date: "2025-01-07",
    size: "2.1 MB",
    type: "JPEG",
    src: "iocl[1].jpg",
    alt: "Mathura Refinery Garden"
  },
  {
    id: 2,
    name: "IndianOil_Petrol_Pump.jpg",
    date: "2025-01-07",
    size: "2.2 MB",
    type: "JPEG",
    src: "iocl[2].jpg",
    alt: "IndianOil Petrol Pump"
  },
  {
    id: 3,
    name: "Mathura_Refinery_Entrance.jpg",
    date: "2025-01-07",
    size: "2.3 MB",
    type: "JPEG",
    src: "iocl[3].jpg",
    alt: "Mathura Refinery Entrance"
  },
  {
    id: 4,
    name: "Mathura_Refinery_Industrial.jpg",
    date: "2025-01-07",
    size: "2.4 MB",
    type: "JPEG",
    src: "iocl[4].jpg",
    alt: "Mathura Refinery Industrial View"
  },
  {
    id: 5,
    name: "Mathura_Refinery_Plant.jpg",
    date: "2025-01-07",
    size: "2.5 MB",
    type: "JPEG",
    src: "iocl[5].jpg",
    alt: "Mathura Refinery Plant"
  },
  {
    id: 6,
    name: "Mathura_Refinery_Aerial.jpg",
    date: "2025-01-07",
    size: "2.6 MB",
    type: "JPEG",
    src: "iocl[6].jpg",
    alt: "Mathura Refinery Aerial View"
  },
  {
    id: 7,
    name: "Mathura_Refinery_Towers.jpg",
    date: "2025-01-07",
    size: "2.7 MB",
    type: "JPEG",
    src: "iocl[7].jpg",
    alt: "Mathura Refinery Towers"
  },
  {
    id: 8,
    name: "Mathura_Refinery_Complex.jpg",
    date: "2025-01-07",
    size: "2.8 MB",
    type: "JPEG",
    src: "iocl[8].jpg",
    alt: "Mathura Refinery Complex"
  }
];

let currentPhotos = [...photos];
let selectedPhotos = new Set();
let currentView = 'large-grid';
let currentPage = 1;
let photosPerPage = 12;
let sortBy = 'date';
let sortOrder = 'desc';
let slideshowInterval = null;
let currentSlideIndex = 0;

// DOM elements
const galleryGrid = document.getElementById('gallery');
const searchInput = document.querySelector('.search-input');
const viewButtons = document.querySelectorAll('.view-btn');
const folderButtons = document.querySelectorAll('.folder');
const photoCountElement = document.getElementById('photoCount');
const selectedCountElement = document.getElementById('selectedCount');
const paginationElement = document.getElementById('pagination');
const uploadBtn = document.getElementById('uploadBtn');
const slideshowBtn = document.getElementById('slideshowBtn');
const downloadBtn = document.getElementById('downloadBtn');
const sortBtn = document.getElementById('sortBtn');
const uploadModal = document.getElementById('uploadModal');
const slideshowModal = document.getElementById('slideshowModal');
const sortOptions = document.getElementById('sortOptions');

// --- Folder & Subfolder Management ---
let folders = [
  {
    id: '2024',
    name: '2024',
    subfolders: [],
    photos: [...photos]
  },
  {
    id: '2025',
    name: '2025',
    subfolders: [],
    photos: []
  },
  {
    id: '2026',
    name: '2026',
    subfolders: [],
    photos: []
  }
];
let selectedFolderId = '2024';
let selectedSubfolderId = null;

// Helper to render folders and subfolders in sidebar
function renderFolders() {
  const yearFolders = document.querySelector('.year-folders');
  yearFolders.innerHTML = '';
  folders.forEach(folder => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder' + (folder.id === selectedFolderId ? ' active' : '');
    folderDiv.id = `folder-${folder.id}`;
    // Add folder icon before folder name
    folderDiv.innerHTML = `<span class="folder-icon">📁</span> <span class="folder-name">${folder.name}</span>`;
    folderDiv.addEventListener('click', () => {
      selectedFolderId = folder.id;
      selectedSubfolderId = null;
      currentPhotos = folder.photos;
      renderFolders();
      renderPhotos();
    });
    yearFolders.appendChild(folderDiv);

    // Render subfolders if this folder is selected
    if (folder.id === selectedFolderId) {
      folder.subfolders.forEach(sub => {
        const subDiv = document.createElement('div');
        subDiv.className = 'folder subfolder' + (sub.id === selectedSubfolderId ? ' active' : '');
        subDiv.style.marginLeft = '24px';
        subDiv.textContent = sub.name;
        subDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedSubfolderId = sub.id;
          currentPhotos = sub.photos;
          renderFolders();
          renderPhotos();
        });
        yearFolders.appendChild(subDiv);
      });
    }
  });
}

// Initialize the gallery
function initializeGallery() {
  renderFolders();
  renderPhotos();
  setupEventListeners();
  updatePhotoCount();
  updateDownloadButtonStatus();
}

// Render photos in the gallery
function renderPhotos() {
  galleryGrid.innerHTML = '';
  
  const sortedPhotos = sortPhotos(currentPhotos);
  const start = (currentPage - 1) * photosPerPage;
  const end = start + photosPerPage;
  const photosToDisplay = sortedPhotos.slice(start, end);
  
  photosToDisplay.forEach(photo => {
    const photoCard = createPhotoCard(photo);
    galleryGrid.appendChild(photoCard);
  });
  
  updatePhotoCount();
  updatePagination(sortedPhotos.length);
  updateDownloadButtonStatus();
}

// Create a photo card element
function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';
  card.innerHTML = `
    <img src="${photo.src}" alt="${photo.alt}" class="photo-image" loading="lazy">
    <div class="photo-info">
      <div class="photo-name">${photo.name}</div>
      <div class="photo-date">${photo.date}</div>
    </div>
  `;
  
  // Selection overlay
  const overlay = document.createElement('div');
  overlay.className = 'selection-overlay';
  overlay.innerHTML = '✓';
  card.appendChild(overlay);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'selection-checkbox';
  checkbox.checked = selectedPhotos.has(photo.id);
  card.appendChild(checkbox);

  // Update card selection state
  if (selectedPhotos.has(photo.id)) {
    card.classList.add('selected');
  }

  checkbox.addEventListener('click', e => {
    e.stopPropagation();
    togglePhotoSelection(photo.id);
  });
  
  // Add click event for photo preview
  card.addEventListener('click', () => {
    openPhotoPreview(photo);
  });
  
  return card;
}

// Toggle photo selection
function togglePhotoSelection(photoId) {
  if (selectedPhotos.has(photoId)) {
    selectedPhotos.delete(photoId);
  } else {
    selectedPhotos.add(photoId);
  }
  
  // Update the photo card visual state
  const photoCard = document.querySelector(`[data-photo-id="${photoId}"]`);
  if (photoCard) {
    photoCard.classList.toggle('selected', selectedPhotos.has(photoId));
  }
  
  updateDownloadButtonStatus();
  updateSelectedCount();
  renderPhotos(); // Re-render to update selection state
}

// Sort photos
function sortPhotos(photos) {
  return [...photos].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'size') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortBy === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

// Update photo count display
function updatePhotoCount() {
  const count = currentPhotos.length;
  photoCountElement.textContent = `${count} photo${count !== 1 ? 's' : ''}`;
}

// Update selected count display
function updateSelectedCount() {
  const count = selectedPhotos.size;
  if (count > 0) {
    selectedCountElement.textContent = `${count} selected`;
    selectedCountElement.style.display = 'inline';
  } else {
    selectedCountElement.style.display = 'none';
  }
}

// Update download button status
function updateDownloadButtonStatus() {
  downloadBtn.disabled = selectedPhotos.size === 0;
}

// Update pagination
function updatePagination(totalPhotos) {
  const totalPages = Math.ceil(totalPhotos / photosPerPage);
  paginationElement.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPhotos();
    }
  });
  paginationElement.appendChild(prevBtn);
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.classList.toggle('active', i === currentPage);
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderPhotos();
    });
    paginationElement.appendChild(pageBtn);
  }
  
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPhotos();
    }
  });
  paginationElement.appendChild(nextBtn);
}

// Open photo preview
function openPhotoPreview(photo) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.alt;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
  `;
  
  modal.appendChild(img);
  document.body.appendChild(modal);
  
  // Close on click
  modal.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Upload functionality
function handleFileUpload(files) {
  const uploadProgress = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  uploadProgress.style.display = 'block';

  let uploaded = 0;
  const total = files.length;
  const targetSubfolderId = uploadModal.dataset.targetSubfolder || null;

  Array.from(files).forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now() + index,
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          type: file.type.split('/')[1].toUpperCase(),
          src: e.target.result,
          alt: file.name
        };

        // Add to correct location
        if (targetSubfolderId) {
          const folder = folders.find(f => f.id === selectedFolderId);
          const sub = folder?.subfolders.find(s => s.id === targetSubfolderId);
          if (sub) sub.photos.push(newPhoto);
        } else {
          const folder = folders.find(f => f.id === selectedFolderId);
          if (folder) folder.photos.push(newPhoto);
        }

        uploaded++;
        const progress = (uploaded / total) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';

        if (uploaded === total) {
          setTimeout(() => {
            uploadProgress.style.display = 'none';
            uploadModal.classList.remove('active');
            uploadModal.dataset.targetSubfolder = '';
            // Show uploaded photos
            if (targetSubfolderId) {
              const folder = folders.find(f => f.id === selectedFolderId);
              const sub = folder?.subfolders.find(s => s.id === targetSubfolderId);
              currentPhotos = sub ? sub.photos : [];
            } else {
              const folder = folders.find(f => f.id === selectedFolderId);
              currentPhotos = folder ? folder.photos : [];
            }
            renderFolders();
            renderPhotos();
          }, 500);
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// Slideshow functionality
function startSlideshow() {
  if (currentPhotos.length === 0) return;
  
  currentSlideIndex = 0;
  slideshowModal.classList.add('active');
  updateSlideshow();
  
  // Auto-advance slideshow
  slideshowInterval = setInterval(() => {
    nextSlide();
  }, 3000);
}

function updateSlideshow() {
  const slideshowImage = document.getElementById('slideshowImage');
  const slideCount = document.getElementById('slideCount');
  const slideTitle = document.getElementById('slideTitle');
  
  if (currentPhotos[currentSlideIndex]) {
    const photo = currentPhotos[currentSlideIndex];
    slideshowImage.src = photo.src;
    slideshowImage.alt = photo.alt;
    slideCount.textContent = `${currentSlideIndex + 1} / ${currentPhotos.length}`;
    slideTitle.textContent = photo.name;
  }
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % currentPhotos.length;
  updateSlideshow();
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + currentPhotos.length) % currentPhotos.length;
  updateSlideshow();
}

function toggleSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    document.getElementById('playPause').textContent = '▶️';
  } else {
    slideshowInterval = setInterval(() => {
      nextSlide();
    }, 3000);
    document.getElementById('playPause').textContent = '⏸️';
  }
}

// Download selected photos
function downloadSelectedPhotos() {
  const selectedPhotoArray = Array.from(selectedPhotos);
  if (selectedPhotoArray.length === 0) return;
  
  selectedPhotoArray.forEach(photoId => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      const link = document.createElement('a');
      link.href = photo.src;
      link.download = photo.name;
      link.click();
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    currentPhotos = photos.filter(photo => 
      photo.name.toLowerCase().includes(searchTerm) ||
      photo.alt.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderPhotos();
  });
  
  // View mode buttons
  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      viewButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const viewMode = button.getAttribute('data-view');
      currentView = viewMode;
      
      galleryGrid.className = `gallery-grid ${viewMode === 'grid' ? 'grid-view' : viewMode === 'list' ? 'list-view' : ''}`;
    });
  });
  
  // Folder navigation
  folderButtons.forEach(button => {
    button.addEventListener('click', () => {
      folderButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      currentPhotos = [...photos];
      currentPage = 1;
      renderPhotos();
    });
  });
  
  // Upload button
  uploadBtn.addEventListener('click', () => {
    uploadModal.classList.add('active');
  });
  
  // Upload area
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  });
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  });
  
  // Slideshow controls
  slideshowBtn.addEventListener('click', startSlideshow);
  
  document.getElementById('nextSlide').addEventListener('click', nextSlide);
  document.getElementById('prevSlide').addEventListener('click', prevSlide);
  document.getElementById('playPause').addEventListener('click', toggleSlideshow);
  
  // Close slideshow
  document.getElementById('slideshowModal').addEventListener('click', (e) => {
    if (e.target === slideshowModal) {
      slideshowModal.classList.remove('active');
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
      }
    }
  });
  
  document.querySelector('.close-slideshow').addEventListener('click', () => {
    slideshowModal.classList.remove('active');
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }
  });
  
  // Download button
  downloadBtn.addEventListener('click', downloadSelectedPhotos);
  
  // Sort functionality
  sortBtn.addEventListener('click', () => {
    sortOptions.classList.toggle('active');
  });
  
  // Sort options
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      sortBy = item.getAttribute('data-sort');
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      sortOptions.classList.remove('active');
      renderPhotos();
    });
  });
  
  // Close modals
  document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.modal').classList.remove('active');
    });
  });
  
  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Close sidebar button
  const closeBtn = document.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const sidebar = document.querySelector('.sidebar');
      sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
    });
  }
  
  // Click outside to close dropdowns
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-btn') && !e.target.closest('.dropdown-menu')) {
      sortOptions.classList.remove('active');
    }
  });
  
  // --- Keyboard Shortcuts for Folder/Subfolder/Upload ---
  document.addEventListener('keydown', (e) => {
    // Search shortcut (Ctrl/Cmd + F)
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
    
    // View mode shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          document.querySelector('[data-view="grid"]').click();
          break;
        case '2':
          e.preventDefault();
          document.querySelector('[data-view="large-grid"]').click();
          break;
        case '3':
          e.preventDefault();
          document.querySelector('[data-view="list"]').click();
          break;
      }
    }
    
    // Slideshow shortcuts
    if (slideshowModal.classList.contains('active')) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case ' ':
          e.preventDefault();
          toggleSlideshow();
          break;
      }
    }
    
    // Select all photos (Ctrl/Cmd + A)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      currentPhotos.forEach(photo => selectedPhotos.add(photo.id));
      renderPhotos();
    }
    
    // Deselect all photos (Escape)
    if (e.key === 'Escape' && selectedPhotos.size > 0) {
      selectedPhotos.clear();
      renderPhotos();
    }

    // Ctrl+O: Create new folder
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
      e.preventDefault();
      const name = prompt('Enter new folder name:');
      if (name) {
        const id = name.replace(/\s+/g, '_') + '_' + Date.now();
        folders.push({ id, name, subfolders: [], photos: [] });
        selectedFolderId = id;
        selectedSubfolderId = null;
        currentPhotos = [];
        renderFolders();
        renderPhotos();
      }
    }

    // Ctrl+B for new subfolder
    if (e.ctrlKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      // Find the selected folder
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        const subfolderName = prompt('Enter subfolder name:');
        if (subfolderName) {
          const subId = Date.now().toString();
          folder.subfolders.push({
            id: subId,
            name: subfolderName,
            photos: []
          });
          selectedSubfolderId = subId;
          currentPhotos = [];
          renderFolders();
          renderPhotos();
        }
      }
    }

    // Ctrl+P: Create subfolder inside selected folder
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        const name = prompt('Enter new subfolder name:');
        if (name) {
          const id = name.replace(/\s+/g, '_') + '_' + Date.now();
          folder.subfolders.push({ id, name, photos: [] });
          selectedSubfolderId = id;
          currentPhotos = [];
          renderFolders();
          renderPhotos();
        }
      }
    }

    // Ctrl+U: Upload to selected subfolder
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      if (selectedSubfolderId) {
        uploadModal.classList.add('active');
        // Mark upload target
        uploadModal.dataset.targetSubfolder = selectedSubfolderId;
      } else {
        alert('Select a subfolder to upload photos.');
      }
    }
  });
}

// Responsive behavior
function handleResize() {
  if (window.innerWidth <= 768) {
    galleryGrid.className = 'gallery-grid';
  } else {
    galleryGrid.className = `gallery-grid ${currentView === 'grid' ? 'grid-view' : currentView === 'list' ? 'list-view' : ''}`;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGallery);
window.addEventListener('resize', handleResize);
