# api2
New api for tovare.com


https://www.googleapis.com/analytics/v3/data/ga?ids=ga%3A78449289&start-date=7daysAgo&end-date=yesterday&metrics=ga%3AuniquePageviews&dimensions=ga%3ApageTitle&sort=-ga%3AuniquePageviews&filters=ga%3Adimension1%3D%3DNyhet&samplingLevel=higher_precision&max-results=10


Mest leste sidetitler de siste 30 dagene:

        'ids': 'ga:78449289',
        'start-date': '30daysAgo',
        'end-date': 'yesterday',
        'sort': '-ga:pageviews',
        'metrics': 'ga:pageviews',
        'dimensions': 'ga:pageTitle',
        'max-results': 10,


Gir antall brukere som er aktive nå:

        'metrics': 'rt:activeUsers',


Gir antall brkere på geografiske punkter:

        'metrics': 'rt:activeUsers',
        'metrics': 'ga:pageviews',


## Generate updated documentation

    npm run doc
    


## Ideer

    http://jsfiddle.net/gp3wvm8o/
    
 
    
    
                /*global later d3*/
            updateRealtimeData();
            var textSched = later.parse.text('every 20 seconds');
            var timer = later.setTimeout(updateRealtimeData, textSched);

            function updateRealtimeData(){
                
                
                d3.json("data/brukere-device-realtime.json", function(error, data) {
                    if(!error){
                    }else{
                        console.log("failed to update devices");
                    }
                });
                d3.json("data/brukere-geo-realtime.json", function(error, data) {
                    if(!error){
                    }else{
                        console.log("failed to update geodata");
                    }
                });
            }


