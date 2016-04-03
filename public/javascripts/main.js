$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

var map;
var markers = [];
var mapLoc;
var infowindow = null;
var marker = [];

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

var neighborhoods = {
  condesa: "19.411594878222246,-99.17109489440918",
  narvarte: "19.39609189284647,-99.16165351867676",
  roma: "19.42369670375637,-99.15603160858154",
  centro: "19.433409891620766,-99.13965940475464",
  coyoacan: "19.350707829717166,-99.16377782821655",
  diana: "19.42476923010596,-99.17147040367126"
};

function createErrorMessage(text) {
  var errorMessage = $('<p>');
  errorMessage.addClass('error');
  errorMessage.html(text);
  return errorMessage;
}

//On DOM Ready

$(function() {
  for (n in neighborhoods) {
    li = $('<li>');
    li.html(n);
    $('#neighborhoodList').append(li);
  }
  $('#neighborhoodList').on('click','li',function(e) {
    var name = $(this).html();
    console.log(name);
    newCenter = neighborhoods[name];
    console.log(newCenter);
    centerMap(newCenter);
  });

  $('#submitNewPlace').click(addLocation);

  $('#signupForm').on('submit', function(e) {
    $('#signupForm p.error').remove();
    e.preventDefault();
    var formData = $(this).serializeObject();
    var err = signupErrors(formData);
    if (err) {
      var errorMessage = createErrorMessage(err);
      $('#signupForm').append(errorMessage);
    }
    else {
      postForm('/users/signup', formData, function(data) {
        console.log(data);
        var err = data.err;
        if (err) {
          errorMessage = createErrorMessage(err);
          $('#signupForm').append(errorMessage);
        }
        else {
          window.location.href = '/';
        }
      });
    }
  });

  $('#loginForm').on('submit',function(e) {
    $('#loginForm p.error').remove();
    e.preventDefault();
    var formData = $(this).serializeObject();
    postForm('/users/login', formData, function(data) {
      var err = data.err;
      if (err) {
        errorMessage = createErrorMessage(err);
        $('#loginForm').append(errorMessage);
      }
      else {
        window.location.href = '/';
      }
    });
  });

  $('#profileForm').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serializeObject();
    postForm('/users/edit', formData, function(data) {
      window.location.href = '/';
    });
  });
});

function signupErrors(formData) {
  var username = formData.username;
  var password = formData.password;
  var confirm = formData.confirm;
  var email = formData.email;
  if (password.length < 6) {
    return 'Password must be at least 6 characters.'
  }
  else if (password != confirm) {
    return 'Passwords do not match.'
  }
  else {
    return null;
  }
}

//General Functions

function initMap() {
  var mapDiv = document.getElementById('map');
  map = new google.maps.Map(mapDiv, {
    center: {lat: 19.406, lng: -99.166},
    zoom: 12
    });

  for (var i=0; i<recentLocations.length;i++) {
    var location = recentLocations[i];
    createMarker(location);
  }

  // This event listener will call addMarker() when the map is clicked.
  map.addListener('click', function(event) {
    if (infowindow) {
      infowindow.close();
      infowindow = null;
    }
    else {
      getLocationMap(event.latLng);
      $('#formOpenButton').click();
    }
    // $('#placeName').focus();
  });
}

function centerMap(locationString) {
  myLat = parseFloat(locationString.split(',')[0]);
  myLng = parseFloat(locationString.split(',')[1]);
  var myLatlng = {lat: myLat, lng: myLng};
  map.setZoom(15);
  map.panTo(myLatlng);
}


// Adds a marker to the map and push to the array.
function addMarker(location) {
  locationObject = {lat: parseFloat(location.split(',')[0]),
                    lng: parseFloat(location.split(',')[1])
                  }
  var marker = new google.maps.Marker({
    position: locationObject,
    map: map
  });
  // mapLoc = location;
  // locString = mapLoc.lat()+','+mapLoc.lng();
  // console.log(locString);
  // requestMapImage(locString);
  // $('#newEntry').show();
  // markers.push(marker);
}

// Adds a marker to the map and push to the array.
function getLocationMap(location) {
  mapLoc = location;
  locString = mapLoc.lat()+','+mapLoc.lng();
  console.log(locString);
  requestMapImage(locString);
  $('#newEntry').show();
}

function requestMapImage(center) {
  var m = $('#mapImg');
  var dimens = m.width()+'x'+m.height();
  var mapRequest = {
    center: center,
    size: dimens,
    zoom: "18",
    maptype: "roadmap",
    markers: "color:red|"+center,
    key: "AIzaSyAYOMRlzJ32KKjQbFrfwCq9SR9AnBmlVKI"}
  query = $.param(mapRequest);
  baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  fullUrl = baseUrl + '?'+query;
  img = $('<img>');
  img.data('center',center)
  img.attr('src',fullUrl);
  $('#mapImg').html('');
  $('#mapImg').append(img);
}

function postForm(url, data, cb) {
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
    contentType: 'application/json; charset=UTF-8',
    url: url,
    success: cb
  });
}

// Add Location
function addLocation(event) {
    event.preventDefault();
    var center = $('#mapImg img').data('center');
    var lat = parseFloat(center.split(',')[0]);
    var lng = parseFloat(center.split(',')[1]);
    var newLocationData = {
        name: $('#placeName').val(),
        description: $('#placeDescription').val(),
        category: $('#foodCategory').val(),
        price: $('#priceRange').val(),
        lat: lat,
        lng: lng
    }
    console.log(JSON.stringify(newLocationData));
    $('#formContainer').modal('toggle');
    $.ajax({
        type: 'POST',
        data: JSON.stringify(newLocationData),
        contentType: 'application/json; charset=UTF-8',
        url: '/addlocation',
        dataType: 'JSON'
    }).done(function( response ) {
        console.log(response);
    });
};

// Query Locations in Viewport

function queryLocations() {
  var bounds = map.getBounds().toJSON();
  console.log(bounds);
  $.ajax({
    type: 'POST',
    data: JSON.stringify(bounds),
    url: '/inview',
    contentType: 'application/json; charset=UTF-8',
    dataType: 'JSON',
    }).done(function(response){
        console.log(response);
  });
}



function createMarker(location) {
    var name = location['name'];
    var cat = location['category'];
    var priceRange = location['price'];
    var html = name;
    var lat = location['lat'];
    var lng = location['lng'];
    var label = labels[labelIndex++ % labels.length]
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        label: label,
        title: html
    });

    var contentString = '<div id="content">'+
    '<h3 id="firstHeading" class="firstHeading">'+
    location['name']
    +'</h3>'+
    '<div>'+
    '<p><b>Contributor:</b> '+
    location['createdBy']+ '</p>' +
    '<p><b>Price:</b> ' +
    location['price'] + '</p>' +
    '<p><b>Comments:</b> '+
    location['description']+
    '</p>'+
    '</div>'+
    '</div>';

    marker['infowindow'] = new google.maps.InfoWindow({
            content: contentString
        });

    google.maps.event.addListener(marker, 'click', function() {
        if (infowindow) {
          infowindow.close();
        }
        infowindow = this['infowindow'];
        infowindow.open(map, this);
    });

    markers.push(marker);
    var index = markers.length -1;
    var li = $('<li>');
    li.html("("+label+") "+name);
    $('#'+cat+'-list').append(li);
    li.click(function() {
      gotoPoint(index);
    });
    // names.push(label+". "+name);
}

function gotoPoint(myPoint){
    map.setCenter(new google.maps.LatLng(markers[myPoint].position.lat(), markers[myPoint].position.lng()));
    map.setZoom(16);
    if (infowindow) {
      infowindow.close();
    }
    infowindow = markers[myPoint]['infowindow'];
    infowindow.open(map, markers[myPoint]);
}

$('.modal').on('shown.bs.modal', function () {
    $(this).find('input:first').focus();
})
