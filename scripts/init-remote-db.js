require('dotenv').config();
const fetch = require('node-fetch');

async function initRemoteDb() {
  try {
    console.log('開始初始化遠程資料庫...');
    
    const response = await fetch('https://cursor-taxi-api.vercel.app/api/init-db', {
      method: 'POST',
      headers: {
        'x-init-key': process.env.INIT_KEY
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '初始化失敗');
    }

    console.log('初始化成功:', data.message);
  } catch (error) {
    console.error('初始化失敗:', error.message);
    process.exit(1);
  }
}

initRemoteDb(); 