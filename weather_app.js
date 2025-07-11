import readline from 'readline/promises'
// visit website weather api for api key and base url 
const API_KEy ='';
const BASE_KEY='';

const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

const getWeather= async (city)=>{
    const url=`${BASE_KEY}?q=${city}&appid=${API_KEy}&units=metric`;

    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error(" City not found . Please check with the city name");
        }
        const weatherData=await response.json();
        console.log("\n Weather information: ");
        console.log(`City : ${weatherData.name}`);
        console.log(`Temperature: ${weatherData.main.temp} C`);
        console.log(`Description : ${weatherData.weather[0].description}`);
        console.log(`Humidity: ${weatherData.main.humidity}%`);
        console.log(`Wind speed : ${weatherData.wind.speed}m/s\n`);

    }catch (error){
        console.error(error);
    }
}

const city= await rl.question(" Enter your city to check weather");
await getWeather(city);
rl.close();

