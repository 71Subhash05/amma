const validRollNumbers = ['23481A5467','23481A5469','23481A5470','23481A5471','23481A5472','23481A5473','23481A5474','23481A5475','23481A5476','23481A5477','23481A5478','23481A5479','23481A5480','23481A5481','23481A5482','23481A5483','23481A5484','23481A5485','23481A5486','23481A5487','23481A5488','23481A5489','23481A5490','23481A5491','23481A5492','23481A5493','23481A5494','23481A5495','23481A5496','23481A5497','23481A5498','23481A5499','23481A54A0','23481A54A1','23481A54A2','23481A54A3','23481A54A4','23481A54A5','23481A54A6','23481A54A7','23481A54A8','23481A54B0','23481A54B1','23481A54B2','23481A54B3','23481A54B4','23481A54B5','23481A54B6','23481A54B7','23481A54B8','23481A54B9','24485A54C0','23481A54C1','23481A54C2','23481A54C3','23481A54C4','23481A54C5','23481A54C6','23481A54C7','23481A54C8','23481A54C9','23481A54D0','23481A54D1','24485A54D2','24485A5408','24485A5409','24485A5410','24485A5411','24485A5412','24485A5413'];

async function initializeUsers() {
  try {
    const usersRef = database.ref('users');
    const snapshot = await usersRef.once('value');
    
    if (!snapshot.exists()) {
      const users = {};
      validRollNumbers.forEach(roll => {
        users[roll] = roll;
      });
      await usersRef.set(users);
    }
    
    const statsRef = database.ref('userStats');
    const statsSnapshot = await statsRef.once('value');
    if (!statsSnapshot.exists()) {
      await statsRef.set({});
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

async function login() {
  try {
    const username = sanitizeInput(document.getElementById('username').value.trim());
    const password = document.getElementById('password').value;
    
    if (!username || !password) return showError('Fill all fields');
    if (!validRollNumbers.includes(username)) return showError('Invalid Roll Number');
    
    const userRef = database.ref('users/' + username);
    const snapshot = await userRef.once('value');
    const userPassword = snapshot.val();
    
    if (userPassword !== password) return showError('Incorrect Password');
    
    const statsRef = database.ref('userStats/' + username);
    await statsRef.update({
      lastLogin: new Date().toLocaleString()
    });
    
    sessionStorage.setItem('currentUser', username);
    sessionStorage.setItem('loginTime', new Date().toLocaleString());
    location.href = 'home.html';
  } catch (error) {
    showError('Login failed: ' + error.message);
  }
}

async function adminLogin() {
  const pass = prompt('Enter Admin Password:');
  if (!pass) return;
  
  try {
    const adminRef = database.ref('admin/password');
    const snapshot = await adminRef.once('value');
    const adminPassword = snapshot.val() || 'BHARATHI';
    
    if (pass === adminPassword) {
      sessionStorage.setItem('currentUser', 'ADMIN');
      location.href = 'admin.html';
    } else {
      showError('Incorrect Admin Password');
    }
  } catch (error) {
    showError('Admin login failed: ' + error.message);
  }
}

function showError(msg) {
  const errorMsg = document.getElementById('errorMsg');
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => errorMsg.style.display = 'none', 3000);
  } else {
    alert(msg);
  }
}

function sanitizeInput(input) {
  return input.replace(/[<>"'&]/g, '');
}

function logout() {
  sessionStorage.clear();
  location.href = 'login.html';
}

async function searchWord() {
  const word = sanitizeInput(document.getElementById('searchWord').value.trim().toLowerCase());
  if (!word) return alert('Enter a word');
  if (!/^[a-z]+$/.test(word)) return alert('Please enter only letters');
  
  const loading = document.getElementById('loading');
  const resultSection = document.getElementById('resultSection');
  loading.style.display = 'block';
  resultSection.style.display = 'none';
  
  try {
    // Fetch English definition and examples
    const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    
    if (!dictResponse.ok) {
      loading.style.display = 'none';
      return alert('Word not found in dictionary');
    }
    
    const dictData = await dictResponse.json();
    const entry = dictData[0];
    const meaning = entry.meanings[0];
    const definition = meaning.definitions[0].definition;
    
    // Get synonyms
    const synonyms = meaning.synonyms?.slice(0, 3).join(', ') || 'N/A';
    
    // Get examples from dictionary
    let examples = [];
    for (let m of entry.meanings) {
      for (let def of m.definitions) {
        if (def.example) examples.push(def.example);
        if (examples.length >= 2) break;
      }
      if (examples.length >= 2) break;
    }
    
    const example1 = examples[0] || `The ${word} is important.`;
    const example2 = examples[1] || `I learned about ${word} today.`;
    
    // Translate word to Telugu using Google Translate API (free)
    const translateWord = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(word)}`);
    const wordTranslation = await translateWord.json();
    const teluguWord = wordTranslation[0][0][0];
    
    // Translate meaning to Telugu
    const translateMeaning = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(definition)}`);
    const meaningTranslation = await translateMeaning.json();
    const teluguMeaning = meaningTranslation[0][0][0];
    
    const result = {
      teluguWord,
      teluguMeaning,
      englishMeaning: definition,
      synonyms,
      useCase1: example1,
      useCase2: example2
    };
    
    displayResult(result, word);
    loading.style.display = 'none';
  } catch (error) {
    loading.style.display = 'none';
    console.error('Search error:', error);
    alert('Error searching word. Please try again.');
  }
}

function displayResult(data, word) {
  document.getElementById('teluguWord').textContent = data.teluguWord || 'N/A';
  document.getElementById('teluguMeaning').textContent = data.teluguMeaning || 'N/A';
  document.getElementById('englishMeaning').textContent = data.englishMeaning || 'N/A';
  document.getElementById('synonyms').textContent = data.synonyms || 'N/A';
  document.getElementById('useCase1').textContent = data.useCase1 || 'N/A';
  document.getElementById('useCase2').textContent = data.useCase2 || 'N/A';
  document.getElementById('resultSection').style.display = 'block';
  
  saveSearchLog(word, data);
}

async function saveSearchLog(word, data) {
  try {
    const currentUser = sessionStorage.getItem('currentUser');
    const logRef = database.ref('searchLogs').push();
    
    await logRef.set({
      id: Date.now(),
      username: currentUser,
      word,
      teluguWord: data.teluguWord,
      teluguMeaning: data.teluguMeaning,
      englishMeaning: data.englishMeaning,
      synonyms: data.synonyms,
      useCase1: data.useCase1,
      useCase2: data.useCase2,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });
    
    const statsRef = database.ref('userStats/' + currentUser);
    const snapshot = await statsRef.once('value');
    const stats = snapshot.val() || { searches: 0, passwordChanges: 0 };
    await statsRef.update({ searches: (stats.searches || 0) + 1 });
  } catch (error) {
    console.error('Save log error:', error);
  }
}

function openStorage() {
  document.getElementById('storageModal').classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

async function verifyStorage() {
  try {
    const password = document.getElementById('storagePassword').value;
    const currentUser = sessionStorage.getItem('currentUser');
    
    const userRef = database.ref('users/' + currentUser);
    const snapshot = await userRef.once('value');
    const userPassword = snapshot.val();
    
    if (userPassword === password) {
      location.href = 'storage.html';
    } else {
      alert('Incorrect Password');
    }
  } catch (error) {
    alert('Verification failed: ' + error.message);
  }
}

async function loadStorage() {
  try {
    const currentUser = sessionStorage.getItem('currentUser');
    const logsRef = database.ref('searchLogs');
    const snapshot = await logsRef.once('value');
    const logs = [];
    
    snapshot.forEach(child => {
      logs.push(child.val());
    });
    
    const tbody = document.getElementById('storageBody');
    const userLogs = currentUser === 'ADMIN' ? logs : logs.filter(l => l.username === currentUser);
    
    tbody.innerHTML = '';
    
    if (userLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No search history found</td></tr>';
      return;
    }
    
    userLogs.forEach(log => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${log.username}</td>
        <td>${log.word}</td>
        <td>${log.teluguWord}</td>
        <td>${log.teluguMeaning}</td>
        <td>${log.englishMeaning}</td>
        <td>${log.synonyms}</td>
        <td>${log.useCase1}</td>
        <td>${log.useCase2}</td>
        <td>${log.date}</td>
        <td>${log.time}</td>
      `;
    });
  } catch (error) {
    console.error('Load storage error:', error);
  }
}

function openChangePassword() {
  document.getElementById('changePasswordModal').classList.add('show');
}

async function changePassword() {
  try {
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    const currentUser = sessionStorage.getItem('currentUser');
    const userRef = database.ref('users/' + currentUser);
    const snapshot = await userRef.once('value');
    const currentPassword = snapshot.val();
    
    if (currentPassword !== oldPass) return alert('Incorrect old password');
    if (newPass.length < 6) return alert('Password must be at least 6 characters');
    if (newPass !== confirmPass) return alert('Passwords do not match');
    
    await userRef.set(newPass);
    
    const statsRef = database.ref('userStats/' + currentUser);
    const statsSnapshot = await statsRef.once('value');
    const stats = statsSnapshot.val() || { searches: 0, passwordChanges: 0 };
    await statsRef.update({ passwordChanges: (stats.passwordChanges || 0) + 1 });
    
    alert('Password changed successfully');
    closeModal('changePasswordModal');
  } catch (error) {
    alert('Password change failed: ' + error.message);
  }
}

async function loadProfile() {
  try {
    const currentUser = sessionStorage.getItem('currentUser');
    const loginTime = sessionStorage.getItem('loginTime');
    
    const statsRef = database.ref('userStats/' + currentUser);
    const snapshot = await statsRef.once('value');
    const stats = snapshot.val() || { searches: 0, passwordChanges: 0 };
    
    const logsRef = database.ref('searchLogs');
    const logsSnapshot = await logsRef.once('value');
    const logs = [];
    logsSnapshot.forEach(child => {
      if (child.val().username === currentUser) logs.push(child.val());
    });
    
    const lastSearch = logs.length > 0 ? logs[logs.length - 1].word : 'None';
    
    document.getElementById('rollNumber').textContent = currentUser;
    document.getElementById('loginTime').textContent = loginTime;
    document.getElementById('totalSearches').textContent = stats.searches || 0;
    document.getElementById('lastSearch').textContent = lastSearch;
    document.getElementById('passwordChanges').textContent = stats.passwordChanges || 0;
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(section).style.display = 'block';
  
  if (section === 'users') loadUsers();
  if (section === 'logs') loadLogs();
}

async function loadUsers() {
  try {
    const usersRef = database.ref('users');
    const snapshot = await usersRef.once('value');
    const users = snapshot.val() || {};
    
    const statsRef = database.ref('userStats');
    const statsSnapshot = await statsRef.once('value');
    const stats = statsSnapshot.val() || {};
    
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = '';
    
    for (let roll in users) {
      const userStat = stats[roll] || { searches: 0, lastLogin: 'Never' };
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${roll}</td>
        <td>${users[roll]}</td>
        <td>${userStat.searches || 0}</td>
        <td>${userStat.lastLogin || 'Never'}</td>
        <td>
          <button onclick="editUser('${roll}')">Edit</button>
          <button onclick="deleteUser('${roll}')" class="danger-btn">Delete</button>
        </td>
      `;
    }
  } catch (error) {
    console.error('Load users error:', error);
  }
}

async function addNewUser() {
  try {
    const roll = sanitizeInput(document.getElementById('newRollNumber').value.trim());
    const password = document.getElementById('newUserPassword').value;
    
    if (!roll || !password) return alert('Fill all fields');
    
    const userRef = database.ref('users/' + roll);
    const snapshot = await userRef.once('value');
    if (snapshot.exists()) return alert('User already exists');
    
    await userRef.set(password);
    alert('User added successfully');
    document.getElementById('newRollNumber').value = '';
    document.getElementById('newUserPassword').value = '';
  } catch (error) {
    alert('Add user failed: ' + error.message);
  }
}

async function editUser(roll) {
  try {
    const newPass = prompt('Enter new password for ' + roll);
    if (newPass) {
      const userRef = database.ref('users/' + roll);
      await userRef.set(newPass);
      alert('Password updated');
      loadUsers();
    }
  } catch (error) {
    alert('Edit user failed: ' + error.message);
  }
}

async function deleteUser(roll) {
  try {
    if (confirm('Delete user ' + roll + '?')) {
      const userRef = database.ref('users/' + roll);
      await userRef.remove();
      loadUsers();
    }
  } catch (error) {
    alert('Delete user failed: ' + error.message);
  }
}

async function loadLogs() {
  try {
    const logsRef = database.ref('searchLogs');
    const snapshot = await logsRef.once('value');
    const logs = [];
    
    snapshot.forEach(child => {
      logs.push({ key: child.key, ...child.val() });
    });
    
    const tbody = document.getElementById('logsBody');
    tbody.innerHTML = '';
    
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;">No search logs found</td></tr>';
      return;
    }
    
    logs.forEach(log => {
      const row = tbody.insertRow();
      row.innerHTML = `
        <td>${log.username}</td>
        <td>${log.word}</td>
        <td>${log.teluguWord}</td>
        <td>${log.teluguMeaning}</td>
        <td>${log.englishMeaning}</td>
        <td>${log.synonyms}</td>
        <td>${log.useCase1}</td>
        <td>${log.useCase2}</td>
        <td>${log.date}</td>
        <td>${log.time}</td>
        <td><button onclick="deleteLog('${log.key}')" class="danger-btn">Delete</button></td>
      `;
    });
  } catch (error) {
    console.error('Load logs error:', error);
  }
}

async function deleteLog(key) {
  try {
    if (confirm('Delete this log?')) {
      const logRef = database.ref('searchLogs/' + key);
      await logRef.remove();
      loadLogs();
    }
  } catch (error) {
    alert('Delete log failed: ' + error.message);
  }
}

async function clearAllLogs() {
  try {
    if (confirm('Clear ALL logs? This cannot be undone!')) {
      const logsRef = database.ref('searchLogs');
      await logsRef.remove();
      loadLogs();
    }
  } catch (error) {
    alert('Clear logs failed: ' + error.message);
  }
}

// Initialize when page loads
window.addEventListener('load', function() {
  if (typeof firebase !== 'undefined' && typeof database !== 'undefined') {
    initializeUsers();
  } else {
    console.error('Firebase not loaded');
  }
});