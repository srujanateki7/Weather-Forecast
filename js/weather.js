'use Strict';

const weatherInfo = {
    liveData: null,
    conditions: {
        '3': {
            label: 'Cloudy',
            icon: 'cloud.png'
        },
        '80': {
            label: 'Slight Rain',
            icon: 'rainy.png'
        },
        '95': {
            label: 'Thuderstorm',
            icon: 'storm.png'
        },
        '96': {
            label: 'Thunderstorm',
            icon: 'storm.png'
        }
    },
    dayDOM: [
        {
          tag: 'li',
          attr: {
            class: 'weather-day'
          },
          'content': {
            tag: 'a',
            attr: {
                href: '#'
            },
            'content': [
                {
                    tag: 'h3',
                    content: {
                        tag: 'date',
                        content: '{{DATE}}'
                    }
                },
                {
                    tag: 'img',
                    attr: {
                        class: 'weather-condition-icon',
                        src: '{{ICON}}',
                        alt: '{{ALT}}'
                    }
                },
                {
                    tag: 'span',
                    attr: {
                        class: 'temp-min'
                    },
                    content: '{{TEMP_MIN}}'
                },
                {
                    tag: 'span',
                    attr: {
                        class: 'temp-max'
                    },
                    content: '{{TEMP_MAX}}'
                }
            ]
          }
        }
    ]   
}

/*
    @Function: replaceValue
    @Description: Find a value from a JSON object and replace with the provided value
    @Param {Object} - Object to find from
    @param {any} - value to find
    @param {any} - value to assign as replacement
    @Returns: null
*/
function replaceValue(obj, value, replacement) {
    // Iterate through the object
    for (let key in obj) {

        if(obj[key] === value) {
            obj[key] = replacement;
        }

        // If value is an object call this function again
        if (typeof obj[key] === 'object') {
            replaceValue(obj[key], value, replacement);
        }
    }
}

/*
    @function: buildTree
    @description: Build a DOM tree based on JSON structure
    @param {Object} - Object to build the DOM from
    @param {Object} - Target DOM object
    @Returns: null
*/
function buildTree(tree, container) {
    tree.forEach(function(node) {
        var el = document.createElement(node.tag);

        if(node.attr) { // Create attributes if any
            for(let key in node.attr) {
                el.setAttribute(key, node.attr[key]);
            }
        }

        if(node.content) {
            if(Array.isArray(node.content)) {
                buildTree(node.content, el);
            } else if(typeof(node.content) === 'object') {
                buildTree([node.content], el);
            } else {
                el.innerHTML = node.content;
            }
        }
        container.appendChild(el);
    });
}


/*
    @Function: generateWeekCards
    @Description: Create the Weather forecast based on the JSON
    @Param: null
    @Returns: null
*/
function generateWeekCards() {
    let dailyArray = weatherInfo.liveData.daily;
    let targetElement = document.querySelector('.weather-week');
    
    for(var i=0; i<dailyArray.time.length; i++) {
        let DOMTree = JSON.parse(JSON.stringify(weatherInfo.dayDOM));
        replaceValue(DOMTree, '{{DATE}}', dailyArray.time[i]);
        replaceValue(DOMTree, '{{ICON}}', `img/${weatherInfo.conditions[dailyArray.weathercode[i]]['icon']}`);
        replaceValue(DOMTree, '{{ALT}}', weatherInfo.conditions[dailyArray.weathercode[i]]['label']);
        replaceValue(DOMTree, '{{TEMP_MIN}}', `Min: ${dailyArray['temperature_2m_min'][i]}${weatherInfo.liveData['daily_units']['temperature_2m_min']}`);
        replaceValue(DOMTree, '{{TEMP_MAX}}', `Max: ${dailyArray['temperature_2m_max'][i]}${weatherInfo.liveData['daily_units']['temperature_2m_min']}`);  
        buildTree(DOMTree, targetElement); // Build the DOM
    }
}

/*
@Function: preFetch
@Description: Fetch the Weather Info from API and store in the cache
@Param: null
@Returns: null
*/
async function preFetch() {
    const weatherData = await fetch('./data/static-weather.json');
    weatherInfo.liveData = await weatherData.json()
    generateWeekCards();
}


//API Weather Data Using City 
const acces_Key = '71839141f60123b878e2443d59f20b9b';
const apiUrl ='https://api.openweathermap.org/data/2.5/weather?units=metric&q=';


//CITY SEACRCH
const searchBox = document.querySelector('.search input');
const searchButton = document.querySelector('.search img');
const weatherIcon =document.querySelector('weather-condition-icon');

async function checkWeather(city){
    const response =await fetch(apiUrl + city + `&appid=${acces_Key}`);


    var data = await response.json();
    console.log(data);

    document.querySelector('.city').innerHTML = data.name;
    document.querySelector('.temp-min').innerHTML = data.main.temp_min +'\u00B0C' ;
    document.querySelector('.temp-max').innerHTML = data.main.temp_max +'\u00B0C';
    // document.querySelector('.weather-condition').innerHTML = data.weather.main;

    if(data.weather[0].main =='clouds'){
        weatherIcon.src ='./img/001-cloudy.svg';
    }
    else if(data.weather[0].main=='rainy'){
        weatherIcon.src ='./img/009-rain.svg';
    }
    else if(data.weather[0].main=='sunny'){
        weatherIcon.src ='./img/004-sunny.svg';
    }
    document.querySelector('body').style.display='block';
    document.querySelector('.error').style.display='none';


}


    

//DISPLAY CITY DATA ONCLICK on SEARCH ICON
searchButton.addEventListener('click', ()=>{
    checkWeather(searchBox.value);
})







//BackgroundChange on Click
// function backgroundThunderStorm(){
//          document.querySelector('body').style.background = "url('./img/thunderstorm-night.jpg') center center / cover";
// }
// function backgroundSlightRain(){
//     document.querySelector('body').style.background = "url('./img/slight-rain.jpg') center center / cover";
// }
// function backgroundCloudyWeather(){
//     document.querySelector('body').style.background = "url('./img/cloudy_weather.jpg') center center / cover";
// }




// A centralized init function to start the JS sequence
function init(){
     preFetch();
   
}

// Initialize the app once the DOM is ready
document.addEventListener('DOMContentLoaded', init);