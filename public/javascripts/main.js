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

  // $('#signupForm').on('submit', function(e) {
  //   $('#signupForm p.error').remove();
  //   e.preventDefault();
  //   var formData = $(this).serializeObject();
  //   var err = signupErrors(formData);
  //   if (err) {
  //     var errorMessage = createErrorMessage(err);
  //     $('#signupForm').append(errorMessage);
  //   }
  //   else {
  //     postForm('/users/signup', formData, function(data) {
  //       console.log(data);
  //       var err = data.err;
  //       if (err) {
  //         errorMessage = createErrorMessage(err);
  //         $('#signupForm').append(errorMessage);
  //       }
  //       else {
  //         window.location.href = '/';
  //       }
  //     });
  //   }
  // });

  // $('#loginForm').on('submit',function(e) {
  //   $('#loginForm p.error').remove();
  //   e.preventDefault();
  //   var formData = $(this).serializeObject();
  //   postForm('/users/login', formData, function(data) {
  //     var err = data.err;
  //     if (err) {
  //       errorMessage = createErrorMessage(err);
  //       $('#loginForm').append(errorMessage);
  //     }
  //     else {
  //       window.location.href = '/';
  //     }
  //   });
  // });

  $('#profileForm').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serializeObject();
    var username = formData['username'];
    if (username.length <= 20) {
      $('#username-error').remove();
      postForm('/users/edit', formData, function(data) {
        window.location.href = '/';
      });
    } else {
      var err = $('<p>');
      err.attr('id','username-error');
      err.html('Name is too long (max. 20)');
      $('#profileForm').append(err);
    }
  });
});

// function signupErrors(formData) {
//   var username = formData.username;
//   var password = formData.password;
//   var confirm = formData.confirm;
//   var email = formData.email;
//   if (password.length < 6) {
//     return 'Password must be at least 6 characters.'
//   }
//   else if (password != confirm) {
//     return 'Passwords do not match.'
//   }
//   else {
//     return null;
//   }
// }

//General Functions

function initMap() {
  var mapDiv = document.getElementById('map');
  map = new google.maps.Map(mapDiv, {
    center: {lat: 19.406, lng: -99.166},
    zoom: 12
    });

  for (var i=0; i<recentLocations.length;i++) {
    var location = recentLocations[i];
    createMarker(i);
  }

  // This event listener will call addMarker() when the map is clicked.
  map.addListener('click', function(event) {
    if (infowindow) {
      infowindow.close();
      infowindow = null;
    }
    else {
      $('#locationForm').find("input[type=text], textarea").val("");
      getLocationMap(event.latLng);
      $('#locationForm').data('status','adding');
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

function getLocationMap(location) {
  mapLoc = location;
  var locString;
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

function createInfoWindow(locationIndex) {
  var location = recentLocations[locationIndex];
  var div = $("<div>");
  div.attr('data-location-index',locationIndex);
  var h3 = $("<h3>");
  h3.html(location.name);
  div.append(h3);
  infodiv = $("<div>");
  p1 = $('<p>');
  p1.html('<b>Contributor:</b> '+location.createdBy);
  p2 = $('<p>');
  p2.html('<b>Price:</b> '+location.price);
  p3 = $('<p>');
  p3.html('<b>Comments:</b> '+location.description);
  infodiv.append(p1).append(p2).append(p3);
  div.append(infodiv);
  if (profile)
    if (location.creatorId == profile.id) {
      editbar = $('<div class="editbar"></div>');
      del = $('<a>');
      del.attr('href','#');
      del.addClass('deleter');
      del.html('delete');
      editbar.append(del);
      edit = $('<a>');
      edit.attr('href','#');
      edit.attr('data-location-index',locationIndex);
      edit.addClass('editor');
      edit.html('edit');
      editbar.append(edit);
      div.append(editbar);
    }
    else {
      report = $('<a>');
      report.attr('href','#');
      report.html('report problem');
      div.append(report);
      console.log('goodbye');
    }
  return div[0].outerHTML
};

// Create/Edit/Delete locations

// Create Location

function addLocation(event) {
    event.preventDefault();
    var url;
    var formStatus = $('#locationForm').data('status');
    var center = $('#mapImg img').data('center');
    var lat = parseFloat(center.split(',')[0]);
    var lng = parseFloat(center.split(',')[1]);
    var locationData = {
        name: $('#placeName').val(),
        description: $('#placeDescription').val(),
        category: $('#foodCategory').val(),
        price: $('#priceRange').val(),
        lat: lat,
        lng: lng
    }
    console.log(JSON.stringify(locationData));
    if (formStatus == 'adding') {
      url = '/locations/add'
    }
    else if (formStatus == 'editing') {
      url = '/locations/edit'
      var locationId = $('#locationForm').data('location-id');
      locationData['locationId'] = locationId;
    }
    $.ajax({
        type: 'POST',
        data: JSON.stringify(locationData),
        contentType: 'application/json; charset=UTF-8',
        url: url,
        success: getAllLocations
      });
    $('#formContainer').modal('toggle');
};

$('body').on('click','a.editor', function(e) {
  console.log('editor clicked');
  var locationIndex = $(this).parent().data('location-index');
  var location = recentLocations[parseInt(locationIndex)];
  var locString = location.lat+','+location.lng;
  requestMapImage(locString);
  $('#locationForm').data('status','editing');
  $('#locationForm').data('location-id',location._id);
  $('#placeName').val(location.name);
  $('#placeDescription').val(location.description);
  $('#foodCategory').val(location.category);
  $('#priceRange').val(location.price);
  $('#formOpenButton').click();
});

$('body').on('click','a.deleter', function(e) {
  console.log('deleter clicked');
  if (confirm("Delete?") == true) {
    var locationIndex = $(this).parent().data('location-index');
    var location = recentLocations[parseInt(locationIndex)];
    var locationId = location._id;
    console.log(locationId);
    deleteData = {locationId: location._id};
    console.log(deleteData);
    $.ajax({
      type: 'POST',
      data: JSON.stringify({locationId: locationId}),
      contentType: 'application/json; charset=UTF-8',
      url: '/locations/delete',
      success: getAllLocations
      });
  }
});

// Searching for and displaying locations

var getAllLocations = function() {
  $.ajax({
    type: 'GET',
    url: '/locations/json',
    success: showLocations
  });
}

function queryLocations(condition) {
  var bounds = map.getBounds().toJSON();
  if (condition == 1) {
    var url = "/inview"
  }
  else {
    url = "/mylocations"
  }
  $.ajax({
    type: 'POST',
    data: JSON.stringify(bounds),
    url: url,
    contentType: 'application/json; charset=UTF-8',
    dataType: 'JSON',
    success: showLocations
  });
}

function showLocations(locations) {
  console.log(locations);
  recentLocations = locations;
  resetMarkers();
  for (var i=0;i<locations.length;i++) {
    createMarker(i);
  }
}

function resetMarkers() {
  $('#foodGroups select').html('');
  for (var i=0;i<markers.length;i++) {
    markers[i].setMap(null);
  }
  labelIndex = 0;
  markers = [];
}

//Marker Creation

function createMarker(locationIndex) {
    var location = recentLocations[locationIndex];
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

    var contentString = createInfoWindow(locationIndex);

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
    var li = $('<option>');
    li.html("("+label+") "+name);
    var listSelector = '#'+cat+'-list'
    $(listSelector).append(li);
    li.click(function() {
      $('select').not(listSelector).val([]);
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
