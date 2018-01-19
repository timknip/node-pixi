import * as main from '../src/index';

describe ('index', function () {
    this.timeout(5000);

    it ('should', (cb) => {
        main.test().then(res => {
            cb();
        }).catch(cb);
    });
});
