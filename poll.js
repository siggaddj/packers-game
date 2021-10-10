const poll = ({ fn, validate, interval, maxAttempts }) => {
  console.log('Start poll...');
  let attempts = 0;

  const executePoll = async (resolve, reject) => {
    console.log('- poll');
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error('Exceeded max attempts'));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
};

const simulateServerRequestTime = interval => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, interval);
  });
};

const TIME_FOR_AUTH_PROVIDER = 10000;
const TIME_TO_CREATE_NEW_USER = 2000;

let fakeUser = null;
const createUser = (() => {
  setTimeout(() => {
    fakeUser = {
      id: '123',
      username: 'testuser',
      name: 'Test User',
      createdAt: Date.now(),
    };
  }, TIME_FOR_AUTH_PROVIDER + TIME_TO_CREATE_NEW_USER);
})();

const mockApi = async () => {
  await simulateServerRequestTime(500);
  return fakeUser;
};

const validateUser = user => !!user;
const POLL_INTERVAL = 1000;
const pollForNewUser = poll({
  fn: mockApi,
  validate: validateUser,
  interval: POLL_INTERVAL,
})
  .then(user => console.log(user))
  .catch(err => console.error(err));
