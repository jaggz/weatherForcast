import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  
  lat:number,
  lon:number,
  country:string,
  state:string
}

// TODO: Define a class for the Weather object
class Weather{
  city:string;
  icon:string;
  iconDescription:string;
  windSpeed:number;
  humidity:number;
  date:Date;
  tempF:number;

  constructor( name:string,icon:string,wind:number,humidity:number,temp:number,date:Date,iconDes:string){ 
    this.city = name;
    this.icon = icon;
    this.tempF = temp;
    this.windSpeed = wind;
    this.humidity = humidity;
    this.date = date;
    this.iconDescription = iconDes;
  }
      
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;

  private apiKey?: string;

  cityName: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';

    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string)  {
    try {
      const response = await fetch(query);// fetching Coordinates of city
      if(response.ok){ // checking if request is sucessfull or not
        const locationData = await response.json();
        return locationData;
      }else{
        return;
      } 
    } catch (err) {
      console.log('Error:', err);
      return err;
    }

  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {

    console.log(locationData);
    let destructData : Coordinates = {
        lat:0,
        lon:0,
        country:'',
        state:''
    }
    if(locationData){
      
      const {lat,lon,country,state} = locationData;   
       destructData = {
        lat:lat,
        lon:lon,
        country:country,
        state:state
      }
    }
    
  return destructData;
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const query:string = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`;// query for coordinates of city
    return query;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string[] {// build query for current and forcast weather for next five days
    //current weather
    const queryCurrent:string = `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    //Next Five days forcast weather
    const queryForcast:string = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    const queryArray = []; 
    queryArray.push(queryCurrent);
    queryArray.push(queryForcast);
    return queryArray;

  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query:string = await this.buildGeocodeQuery();// build query
    const locationDataArry : Coordinates[]= await this.fetchLocationData(query);//fetching location coordinates
    const dataObject:Coordinates[] = locationDataArry.filter((data)=>data.country === "US");//filter data country US only 
    return this.destructureLocationData(dataObject[0]);// Passing first element of array bcz there may be multiple cities in US for different states and destructured it
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const query:string[] = this.buildWeatherQuery(coordinates);//building queries fr weatherdata
    try {
      const responseCurrentWeather = await fetch(query[0]);//Fetching current weather
      const responseForecastWeather = await fetch(query[1]);//Fetching Forcast weather for next five days for evry three Hours
      const currentWeatherData = await responseCurrentWeather.json();//getting json data from responsecurrent data
      const forecastWeatherData = await responseForecastWeather.json();//getting json data from responseforcast data
      const currentWeather:Weather= this.parseCurrentWeather(currentWeatherData);// destruct data what we require from whole data for current weather
      const forecastWeatherArray = [];
      for(let i = 4; i<forecastWeatherData.list.length;i+=8) {//for loop to extract forcast data for five days 
        const forecastWeather:Weather={ //extract data in the object of type weather
          city:forecastWeatherData.city.name,
          icon:forecastWeatherData.list[i].weather[0].icon,
          iconDescription:forecastWeatherData.list[i].weather[0].description,
          windSpeed:forecastWeatherData.list[i].wind.speed,
          tempF:forecastWeatherData.list[i].main.temp,
          humidity:forecastWeatherData.list[i].main.humidity,
          date:forecastWeatherData.list[i].dt_txt    
        }
        forecastWeatherArray.push(forecastWeather);  //push each object type weather in forecastWeatherArray 
      }
      console.log(currentWeather);
      console.log("--------");
      console.log(forecastWeatherArray);
      return this.buildForecastArray(currentWeather,forecastWeatherArray);//build and return ForecastArray with currentWeather data and Forcasteddata for five days in one Array 
    } catch (err) {
      console.log('Error:', err);
      return err;
      
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {

    const currentWeather : Weather = {
      city:response.name,
      icon:response.weather[0].icon,
      iconDescription:response.weather[0].description,
      windSpeed:response.wind.speed,
      tempF:response.main.temp,
      humidity:response.main.humidity,
      date:new Date()
    } 
    return currentWeather;
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]){ //Return build andForecastArray with currentWeather data and Forcasteddata for five days 
    const forcastArry  = [];
      forcastArry.push(currentWeather);
      forcastArry.push(weatherData);
    return forcastArry;

  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    
    this.cityName = city;
    const weatherLocationData: Coordinates = await this.fetchAndDestructureLocationData(); //callinf function fetchAndDestructureLocationData to get location data

    const weatherdata = await this.fetchWeatherData(weatherLocationData); // fetching weather data with location data passing to Method fetchWeatherData 
  
    return weatherdata;
  }
}

export default new WeatherService();
