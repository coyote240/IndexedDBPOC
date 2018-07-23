if(!indexedDB) {
  alert('Your browser does not support IndexedDB');
}

function openDb (dbName) {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(dbName);

    request.onerror = event => {
      reject(event);
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = event => {
      freshDB = true;
      initDb(event);
    };
  });
}

function initDb (event) {
  let db = event.target.result;

  let objectStore = db.createObjectStore('dwarves', { keyPath: 'name' });

  objectStore.createIndex('name', 'name', { unique: true });
  objectStore.createIndex('story', 'story', { unique: false });
}

function getDwarves () {
  let request = new Request('dwarves.json');

  return fetch(request).then(response => {
    return response.blob();
  }).then(blob => {
    return readAsText(blob);
  }).then(json => {
    return JSON.parse(json);
  });
}

function storeDwarves (db, dwarves) {
  return new Promise((resolve, reject) => {
    let store = db.transaction('dwarves', 'readwrite')
      .objectStore('dwarves');

    store.onerror = event => {
      reject(event);
    };

    dwarves.forEach(dwarf => {
      let request = store.put(dwarf);

      request.onerror = event => {
        console.log('error!', event);
      };

      request.onsuccess = event => {
        console.log(`success adding ${event.target.result}`);
      };
    });

    resolve(dwarves);
  });
}

function readAsText (blob) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });

    reader.readAsText(blob);
  });
}

function initForm () {
  let form = document.getElementById('dwarf-filter');
  let select = document.getElementById('story');
}

function displayDwarves (dwarves) {
  let target = document.getElementById('dwarves'),
      hobbit = document.getElementById('the-hobbit'),
      snowwhite = document.getElementById('snow-white');

  
}

openDb('DwarfDB').then(db => {

  return getDwarves().then(dwarves => {
    return storeDwarves(db, dwarves);
  });

}).then(dwarves => {
  console.log(dwarves);
}).catch(error => {
  console.log(error);
});
