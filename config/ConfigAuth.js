require('dotenv').config();
module.exports = {
  jwt_secret:
    process.env.JWT_SECRET ||
    'fgk4wr97hk43skl340vkj349fkwej592kkj4708sl12086jdf9845fmg9834kkf',
};
