const fs = require('fs');

async function testV2() {
    try {
        const response = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/run");
        const data = await response.json();
        console.log("V2 'run' number of meanings:", data[0].meanings.length);
        let count = 0;
        data[0].meanings.forEach(m => count += m.definitions.length);
        console.log("V2 'run' number of definitions total:", count);
        
    } catch (e) { console.log("V2 err", e.message); }
}

async function testV1() {
    try {
        const response = await fetch("https://freedictionaryapi.com/api/v1/entries/en/run");
        const data = await response.json();
        let count = 0;
        data.entries.forEach(e => {
           if(e.senses) count += e.senses.length; 
        });
        console.log("V1 'run' number of senses total:", count);
    } catch (e) { console.log("V1 err", e.message); }
}

(async () => {
    await testV2();
    await testV1();
})();
