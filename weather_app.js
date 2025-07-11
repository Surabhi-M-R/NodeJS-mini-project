import readline from 'readline/promises'

const API_KEy ='';
const BASE_KEY='';

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

const getWeather= async (city)=>{
    const url=`${BASE_KEY}?q=${city}&appid=${API_KEy}&units=metric`;
}

const city=rl.question(" Enter your city to check weather");
await getWeather(city);
rl.close();
