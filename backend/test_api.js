import axios from 'axios';

async function testApi() {
  try {
    const loginRes = await axios.post('http://localhost:4001/signin', {
      phone: '9988776655',
      password: 'bypass'
    });
    const token = loginRes.data.token;
    console.log("Got token!", token.substring(0, 15) + "...");
    
    // Now call getUserHome
    const homeRes = await axios.get('http://localhost:4001/getUserHome/998877', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log("getUserHome response:");
    console.log(JSON.stringify(homeRes.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
testApi();
