// CSPC Campus Maintenance System - Frontend Utilities

document.addEventListener('DOMContentLoaded', () => {
  // 1. Accessibility Barrier Auto-Priority Trigger (IR2)
  const categorySelect = document.getElementById('category');
  const prioritySelect = document.getElementById('priority');
  const accessibilityAlert = document.getElementById('accessibilityAlert');

  if (categorySelect && prioritySelect) {
    categorySelect.addEventListener('change', () => {
      if (categorySelect.value === 'Accessibility Barrier') {
        prioritySelect.value = 'High';
        if (accessibilityAlert) {
          accessibilityAlert.classList.remove('d-none');
        }
      } else {
        if (accessibilityAlert) {
          accessibilityAlert.classList.add('d-none');
        }
      }
    });

    // Check on initial load if pre-filled
    if (categorySelect.value === 'Accessibility Barrier' && accessibilityAlert) {
      accessibilityAlert.classList.remove('d-none');
    }
  }

  // 2. Photo Upload Live Preview (FN-3 / AI-1)
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreview');
  const previewContainer = document.getElementById('photoPreviewContainer');

  if (photoInput && photoPreview && previewContainer) {
    photoInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        // Validate size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB limit. Please choose a smaller photo.');
          this.value = '';
          previewContainer.classList.add('d-none');
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          photoPreview.src = e.target.result;
          previewContainer.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
      } else {
        previewContainer.classList.add('d-none');
      }
    });
  }

  // 3. Dynamic Room Suggestions based on Building (AI-3 / FN-2)
  const buildingSelect = document.getElementById('building');
  const roomDataList = document.getElementById('roomSuggestions');

  const buildingRoomsMap = {
    'Faculty Center': ['Room 101 (Dean Office)', 'Room 202 (Conference Room)', 'Room 302 (Faculty Office)', 'Faculty Restroom (East Wing)'],
    'Science Building': ['Physics Laboratory', 'Chemistry Laboratory', 'Biology Lecture Hall', 'Main Front Entrance Ramp'],
    'Engineering Building': ['Computer Lab 1', 'CAD Studio 201', 'Electronics Workshop', 'Civil Testing Ground'],
    'Student Center': ['IT Laboratory Room 204', 'Student Council Office', 'Canteen Area', 'Audio Visual Room'],
    'Main Academic Building': ['Room 101', 'Room 102', 'Room 201', 'Auditorium', 'Elevator Shaft 1'],
    'University Library': ['Circulation Desk', 'Reference Section 2F', 'Digital Media Center', 'Quiet Study Hall'],
    'Campus Gymnasium': ['Basketball Court', 'Locker Room (Men)', 'Locker Room (Women)', 'Bleachers Section B'],
    'Administration Building': ['Registrar Window 1-4', 'Accounting Office', 'President Office', 'Cashier Lobby']
  };

  if (buildingSelect && roomDataList) {
    buildingSelect.addEventListener('change', () => {
      const selectedBldg = buildingSelect.value;
      roomDataList.innerHTML = '';
      if (buildingRoomsMap[selectedBldg]) {
        buildingRoomsMap[selectedBldg].forEach(room => {
          const opt = document.createElement('option');
          opt.value = room;
          roomDataList.appendChild(opt);
        });
      }
    });
  }

  // 4. Quick Demo Login Autofill Helpers for Defense & Showcase
  const demoButtons = document.querySelectorAll('.demo-login-btn');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  demoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const demoEmail = btn.getAttribute('data-email');
      const demoPass = btn.getAttribute('data-password');
      if (emailInput && passwordInput) {
        emailInput.value = demoEmail;
        passwordInput.value = demoPass;
        // Visual feedback
        btn.classList.add('btn-primary');
        setTimeout(() => btn.classList.remove('btn-primary'), 400);
      }
    });
  });

  // 5. Initialize Bootstrap Tooltips & Popovers
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
