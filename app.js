if(!indexedDB) {
  alert('Your browser does not support IndexedDB');
}

if(!navigator.serviceWorker.controller) {

  navigator.serviceWorker.register('/worker.js', { scope: '/' }).then( reg => {

    navigator.serviceWorker.controller.postMessage('foo');

  }).catch(err => {
    console.log('Registration failed: ', err);
  });

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
      let db = initDb(event);
      resolve(db);
    };
  });
}

function initDb (event) {
  let db = event.target.result;

  let objectStore = db.createObjectStore('dwarves', { keyPath: 'name' });

  objectStore.createIndex('name', 'name', { unique: true });
  objectStore.createIndex('story', 'story.id', { unique: false });

  return db;
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

function loadStories (db) {
  return new Promise((resolve, reject) => {
    let stories = {};

    let objectStore = db.transaction('dwarves')
      .objectStore('dwarves');

    objectStore.openCursor().onsuccess = (event) => {
      let cursor = event.target.result;
      if(cursor) {
        let story = cursor.value.story;
        stories[story.id] = story;
        cursor.continue();
      } else {
        resolve(stories);
      }
    };

  });
}

function getDwarvesByStory(storyid) {
  return new Promise((resolve, reject) => {
    openDb('DwarfDB').then(db => {

      let store = db.transaction('dwarves').objectStore('dwarves');
      let index = store.index('story');
      let request = index.getAll(IDBKeyRange.only(storyid));

      request.onsuccess = event => {
        resolve(event.target.result);
      };

      request.onerror = event => {
        reject(event);
      };

    });
  });
}

function displayFilteredDwarves(dwarves) {
  let output = document.getElementById('filtered-dwarves');
  while(output.firstChild) {
    output.removeChild(output.firstChild);
  }

  dwarves.forEach(dwarf => {
    let item = document.createElement('li');
    item.appendChild(document.createTextNode(dwarf.name));

    output.appendChild(item);
  });
}

function initForm (stories) {
  let form = document.getElementById('dwarf-filter');
  let select = document.getElementById('story');

  select.onchange = (event) => {
    getDwarvesByStory(event.target.value).then(result => {
      displayFilteredDwarves(result);
    });
  };

  Object.values(stories).forEach(story => {
    let option = document.createElement('option');
    option.setAttribute('value', story.id);
    option.appendChild(document.createTextNode(story.title));

    select.appendChild(option);
  });
}

openDb('DwarfDB').then(db => {

  getDwarves().then(dwarves => {
    return storeDwarves(db, dwarves);
  });

  return db

}).then(db => {
  return loadStories(db);
}).then(stories => {
  initForm(stories);
}).catch(error => {
  console.log(error);
});
