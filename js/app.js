// Constant which will be used in google map initialization
MAPSETTING = {
    zoom: 12,
    center: {lat: 35.697957, lng: 139.755399}
}

// This will be used to keep track of alert is done or not when wikipedia API error
var alerted = false;

// These stations are major stations in Tokyo, Japan

var initialStations = [
    {
        name: "Shinjuku Station",
        lat: 35.690165,
        lon: 139.699787
    },
    {
        name: "Yotsuya Station",
        lat: 35.685941,
        lon: 139.730710
    },
    {
        name: "Tokyo Station",
        lat: 35.681319,
        lon: 139.766447
    },
    {
        name: "Akihabara Station",
        lat: 35.698337,
        lon: 139.773250
    },
    {
        name: "Shibuya Station",
        lat: 35.658102,
        lon: 139.701913
    }
];

function Model(station){
    var self = this;
    self.name = station.name;
    self.lat = station.lat;
    self.lon = station.lon;
    self.visible = ko.observable(true);

    self.contentString = "";

    self.infowindow = new google.maps.InfoWindow({
        content: self.contentString
    });

    // Wikipedia ajax requesting code starts

    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.name + '&format=json';

    // In case of Shinjuku Station
    // https://en.wikipedia.org/w/api.php?action=opensearch&search=' + "Shinjuku Station" + '&format=json'
    // ["ShinjukuStation",["Shinjuku Station"],
    // ["Shinjuku Station (\u65b0\u5bbf\u99c5, Shinjuku-eki) is a major railway station in Shinjuku and Shibuya wards in Tokyo, Japan."],
    // ["https://en.wikipedia.org/wiki/Shinjuku_Station"]]

    var request =$.ajax({
        url: wikiUrl,
        dataType: "jsonp",
    });

    request.done(function(response) {
        var articleList = response[1];
        console.log(response.length);
        var articleTitle = articleList[0];

        //TODO: Want to add explanation of article to info window
        var url = 'https://en.wikipedia.org/wiki/' + articleTitle;
        self.contentString = self.contentString + '<div><a href="' + url + '">' + articleTitle + '</a></div>';

        self.infowindow = new google.maps.InfoWindow({
            content: self.contentString
        })
        }
    );

    // use alerted to check already show alert or not
    request.fail(function() {
        if (alerted === false) {
            console.log("failed")
            alert("Wikipedia API can not be called properly, please refresh browser and try again.");
            alerted = true
        } else {
            console.log("failed")
        }
        }
    );

    // Wikipedia ajax requesting code ends

    self.marker = new google.maps.Marker({
        position: new google.maps.LatLng(station.lat, station.lon),
        map: map,
        title: station.name
    });

    // Tip: Instead of setMap, you can also use setVisible(true|false),
    // which only shows/hides the marker instead of adding/removing it to/from the map.

    // Need to find the way to hide infowindow when marker is hidden

    // self.showMarker = ko.computed(function() {
    //     if(self.visible() === true) {
    //         self.marker.setVisible(true);
    //         // self.marker.showInfoWindow();
    //     } else {
    //         self.marker.setVisible(false);
    //         self.InfoWindow.close();
    //     }
    //     return true;
    // }, self);

    // keep previous code for now
    self.showMarker = ko.computed(function() {
        if(self.visible() === true) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
        return true;
    }, self);

    // Tip: Right now this function will be re-created for every instances of this class.
    // It would be cleaner and more memory-efficient to convert this to a method you learned about in this course for that, i.e.:
    // Location.prototype.bounce = function() {
    // // "this" is the current instance
    // };
    // Because of the prototype chain, the instances can use it as their own function.

    // below is previous code.
    // this.bounce = function(place) {
    //     google.maps.event.trigger(self.marker, 'click');
    // };

    // below is updated code, will take udacity cource for OO javascript

    // image: Model.AkihabaraStation.bounce
    Model.prototype.bounce = function() {
        // we store the value of this
        // this refers to the current instance
        var self = this;
        google.maps.event.trigger(self.marker, 'click');
    };

    self.marker.addListener('click', function() {
        self.infowindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100); // one bounce takes 700ms, so set as muliplication of 700ms, bounce 3times
    });
};


function AppViewModel() {
    var self = this;

    self.searchTerm = ko.observable("");

    self.stationList = ko.observableArray([]);

    // Developer-to-Developer tip: I'd move these into a SETTINGS constant
    // and to the top of the file or even better, to a separate file.
    // This way if you want to change these in the future, you won't have to dig deep in your code.
    map = new google.maps.Map(document.getElementById('map'), MAPSETTING);

    initialStations.forEach(function(station){
        self.stationList.push( new Model(station));
    });

    self.filteredList = ko.computed( function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.stationList().forEach(function(station){
                station.visible(true);
            });
            return self.stationList();
        } else {
            return ko.utils.arrayFilter(self.stationList(), function(station) {
                var string = station.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                station.visible(result);
                return result;
            });
        }
    }, self);

    self.mapElem = document.getElementById('map');
}

function initApp() {
    ko.applyBindings(new AppViewModel());
}

function googleError() {
    alert("Failed to call Google map API, please check your internet coneection.");
}

// below codes for refference from google developer site

// var map;
// function initMap() {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: 59.327, lng: 18.067},
//     zoom: 8
//   });
// }

// The following example creates a marker in Stockholm, Sweden using a DROP
// animation. Clicking on the marker will toggle the animation between a BOUNCE
// animation and no animation.

// var marker;

// function initMap() {
//   var map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 13,
//     center: {lat: 59.325, lng: 18.070}
//   });

//   marker = new google.maps.Marker({
//     map: map,
//     draggable: false,
//     animation: google.maps.Animation.DROP,
//     position: {lat: 59.327, lng: 18.067}
//   });
//   marker.addListener('click', toggleBounce);
// }

// function toggleBounce() {
//   if (marker.getAnimation() !== null) {
//     marker.setAnimation(null);
//   } else {
//     marker.setAnimation(google.maps.Animation.BOUNCE);
//   }
// }