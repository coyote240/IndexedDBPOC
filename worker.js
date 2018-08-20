// Notify when database is loaded

self.addEventListener('install', event => {
  console.log('install event fired');
  console.log('Permission: ', Notification.permission);
});

self.addEventListener('activate', event => {
  console.log('activate event fired');

  event.waitUntil(() => {
    self.clients.claim();
  });
});

self.addEventListener('message', event => {
  console.log('received message');

  self.registration.showNotification(event.data, {
    actions: [
      { action: 'Like', title: 'Like' },
      { action: 'Reply', title: 'Reply'}
    ]
  });
});
