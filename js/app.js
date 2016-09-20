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
    this.name = station.name;
    this.lat = station.lat;
    this.lon = station.lon;
    this.visible = ko.observable(true);

    self.contentString = "";

    this.infowindow = new google.maps.InfoWindow({
        content: self.contentString
    });

    // Wikipedia ajax requesting code starts

    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name + '&format=json';

    // In case of Shinjuku Station
    // https://en.wikipedia.org/w/api.php?action=opensearch&search=' + "Shinjuku Station" + '&format=json'
    // ["ShinjukuStation",["Shinjuku Station"],
    // ["Shinjuku Station (\u65b0\u5bbf\u99c5, Shinjuku-eki) is a major railway station in Shinjuku and Shibuya wards in Tokyo, Japan."],
    // ["https://en.wikipedia.org/wiki/Shinjuku_Station"]]


    // after waiting 8000ms, change text to fail message
    var wikiRequestTimeout = setTimeout(function(){
        this.contentString = this.contentString + 'failed to get wikipedia resources';
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        // jsonp: "callback";
        // https://www.mediawiki.org/wiki/API:Main_page/ja
        success: function(response) {
            var articleList = response[1];
            console.log(response.length);
            var articleTitle = articleList[0];

            //TODO: Want to add explanation of article to info window
            var url = 'https://en.wikipedia.org/wiki/' + articleTitle;
            self.contentString = self.contentString + '<div><a href="' + url + '">' + articleTitle + '</a></div>';

            self.infowindow = new google.maps.InfoWindow({
                content: self.contentString
            });
            // clear timeout in case data correctly is retrieved
            clearTimeout(wikiRequestTimeout);
        }
    });
    // Wikipedia ajax requesting code ends

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(station.lat, station.lon),
        map: map,
        title: station.name
    });

    this.showMarker = ko.computed(function() {
        if(this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };

    this.marker.addListener('click', function() {
        self.infowindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 3000);
    });
};


function AppViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.stationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: 35.697957, lng: 139.755399}
    });

    initialStations.forEach(function(station){
        self.stationList.push( new Model(station));
    });

    this.filteredList = ko.computed( function() {
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

    this.mapElem = document.getElementById('map');
}

function initApp() {
    ko.applyBindings(new AppViewModel());
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