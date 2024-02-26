const STATE = {
    PENDING: 'pending',
    SUCCESS: 'fulfilled',
    REJECTED: 'rejected'
  }
  class MyPromise {
    #value = null;
    #state = STATE.PENDING;
    #successCallbacks = [];
    #rejectedCallbacks = [];
  
    constructor(executorFunc) {
      try {
        executorFunc(
          val => this.#resolve(val),
          val => this.#reject(val)
        )
      } catch(e) {
        this.#reject(e)      
      }
    }
  
    #resolve(val) {
      this.#value = val;
      this.#state = STATE.SUCCESS;
      this.#successCallbacks.forEach(cb => cb());
    }
  
    #reject(val) {
      this.#value = val;
      this.#state = STATE.REJECTED;
      this.#rejectedCallbacks.forEach(cb => cb());
    }
  
    then(onFulfilled, onRejected) {
      return new MyPromise((resolve, reject) => {
        const successCallback = () => {
          if(!onFulfilled) return resolve(this.#value);
          queueMicrotask(() => {
            try {
              resolve(onFulfilled(this.#value));
            } catch(e) {
              reject(e);
            }
          })
        }
        const failedCallback = () => {
          if(!onRejected) return reject(this.#value);
          queueMicrotask(() => {
            try {
              resolve(onRejected(this.#value));
            } catch(e) {
              reject(e);
            }
          })
        }
        switch(this.state) {
          case STATE.PENDING:
            this.#successCallbacks.push(successCallback);
            this.#rejectedCallbacks.push(failedCallback);
            break;
          case STATE.SUCCESS:
            successCallback();
            break;
          case STATE.REJECTED:
            failedCallback();
            break;
          default:
            throw new Error('Unknown state')
        }
      });
    }
  
    catch(onRejected) {
      return this.then(null, onRejected);
    }
  
    get state() {
      return this.#state;
    }
  
    get value() {
      return this.#value;
    }
  }
  
  function fooA(a) {
      return new MyPromise((resolve, reject) => {
        if(a === -1) reject('Cannot use -1');
      
          setTimeout(() => {
          resolve(a);
      }, 400);
    });
  }
  
  function fooB(b) {
      return new MyPromise((resolve, reject) => {
        if(b === -1) reject(error);
          setTimeout(() => {
          resolve(b);
      }, 400)  
    });
  }
  
  
  fooA(-1)
      .then((resp, error) => {
        if(error) return console.error(error);
      console.log(resp);
    })
    .catch(error => {
        console.error(error)
    })